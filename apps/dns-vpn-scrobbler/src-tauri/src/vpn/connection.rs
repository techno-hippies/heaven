use super::types::{SystemReadiness, VpnStatus, WG_INTERFACE};
use std::path::PathBuf;
use std::process::Command;

/// Check if required tools are available (Linux)
pub fn check_prerequisites() -> Result<(), String> {
    // Check wg-quick
    if !std::path::Path::new("/usr/bin/wg-quick").exists() {
        return Err(
            "WireGuard tools not found. Please install wireguard-tools:\n\
             Ubuntu/Debian: sudo apt install wireguard-tools\n\
             Fedora: sudo dnf install wireguard-tools\n\
             Arch: sudo pacman -S wireguard-tools"
                .to_string(),
        );
    }

    // Check pkexec for privilege escalation
    if !std::path::Path::new("/usr/bin/pkexec").exists() {
        return Err(
            "pkexec not found. Please install polkit:\n\
             Ubuntu/Debian: sudo apt install policykit-1\n\
             Fedora: sudo dnf install polkit\n\
             Arch: sudo pacman -S polkit"
                .to_string(),
        );
    }

    Ok(())
}

/// Check system readiness for VPN operations
pub fn check_system_ready() -> SystemReadiness {
    match check_prerequisites() {
        Ok(()) => SystemReadiness {
            ready: true,
            error: None,
        },
        Err(e) => SystemReadiness {
            ready: false,
            error: Some(e),
        },
    }
}

/// Check if WireGuard interface exists (no elevation needed)
pub fn check_interface_exists() -> bool {
    std::path::Path::new(&format!("/sys/class/net/{}", WG_INTERFACE)).exists()
}

/// Get current VPN status
pub fn get_status(config_path: &Option<PathBuf>, wallet_address: &Option<String>) -> VpnStatus {
    let interface_exists = check_interface_exists();

    VpnStatus {
        connected: interface_exists,
        interface_exists,
        config_saved: config_path.is_some(),
        wallet: wallet_address.clone(),
    }
}

/// Activate VPN tunnel using pkexec + wg-quick (Linux)
/// DNS configuration is handled by PostUp/PostDown scripts in the WireGuard config
pub fn vpn_up(config_path: &PathBuf) -> Result<(), String> {
    check_prerequisites()?;

    log::info!("Activating VPN with config: {:?}", config_path);

    // First, ensure any existing interface is down
    if check_interface_exists() {
        let _ = Command::new("pkexec")
            .args([
                "/usr/bin/wg-quick",
                "down",
                config_path.to_str().ok_or("Invalid config path")?,
            ])
            .output();
    }

    // Bring up the interface
    let output = Command::new("pkexec")
        .args([
            "/usr/bin/wg-quick",
            "up",
            config_path.to_str().ok_or("Invalid config path")?,
        ])
        .output()
        .map_err(|e| format!("Failed to execute wg-quick: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!(
            "wg-quick up failed: {}\n{}",
            stderr.trim(),
            stdout.trim()
        ));
    }

    log::info!("VPN activated successfully");
    Ok(())
}

/// Deactivate VPN tunnel
pub fn vpn_down(config_path: &Option<PathBuf>) -> Result<(), String> {
    check_prerequisites()?;

    log::info!("Deactivating VPN");

    // Try config path first, fallback to interface name
    let down_arg = if let Some(path) = config_path {
        path.to_string_lossy().to_string()
    } else if check_interface_exists() {
        log::warn!("Config path unknown, attempting to bring down by interface name");
        WG_INTERFACE.to_string()
    } else {
        return Err("No VPN interface to deactivate".to_string());
    };

    let output = Command::new("pkexec")
        .args(["/usr/bin/wg-quick", "down", &down_arg])
        .output()
        .map_err(|e| format!("Failed to execute wg-quick: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        // Don't fail if interface doesn't exist
        if !stderr.contains("is not a WireGuard interface") && !stderr.contains("does not exist") {
            return Err(format!("wg-quick down failed: {}", stderr.trim()));
        }
    }

    log::info!("VPN deactivated");
    Ok(())
}
