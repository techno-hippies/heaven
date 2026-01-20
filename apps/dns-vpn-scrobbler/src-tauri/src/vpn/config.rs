use super::types::{VpnPersistedMetadata, VPN_METADATA_FILE, WG_INTERFACE};
use std::fs::{OpenOptions, Permissions};
use std::io::Write;
use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};
use std::path::PathBuf;

/// Save WireGuard config to app data directory with secure permissions (0600)
pub fn persist_config(app_dir: &PathBuf, config: &str, wallet: &str) -> Result<PathBuf, String> {
    std::fs::create_dir_all(app_dir).map_err(|e| format!("Failed to create dir: {}", e))?;

    let config_path = app_dir.join(format!("{}.conf", WG_INTERFACE));

    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600) // Owner read/write only
        .open(&config_path)
        .map_err(|e| format!("Failed to create config file: {}", e))?;

    file.write_all(config.as_bytes())
        .map_err(|e| format!("Failed to write config: {}", e))?;

    // Ensure 0600 even on existing files
    std::fs::set_permissions(&config_path, Permissions::from_mode(0o600))
        .map_err(|e| format!("Failed to set permissions: {}", e))?;

    log::info!("Saved VPN config to {:?} with mode 0600", config_path);

    // Save metadata for restart recovery
    let metadata = VpnPersistedMetadata {
        config_path: Some(config_path.to_string_lossy().to_string()),
        wallet_address: Some(wallet.to_string()),
    };
    save_metadata(app_dir, &metadata)?;

    Ok(config_path)
}

/// Export WireGuard config to user-selected location
pub fn export_config(config: &str, filename: &str) -> Result<(), String> {
    let path = rfd::FileDialog::new()
        .set_file_name(filename)
        .add_filter("WireGuard Config", &["conf"])
        .save_file();

    if let Some(path) = path {
        std::fs::write(&path, config).map_err(|e| format!("Failed to write: {}", e))?;
        log::info!("Exported VPN config to {:?}", path);
    }

    Ok(())
}

/// Save VPN metadata to disk
pub fn save_metadata(app_dir: &PathBuf, metadata: &VpnPersistedMetadata) -> Result<(), String> {
    let metadata_path = app_dir.join(VPN_METADATA_FILE);
    let json = serde_json::to_string_pretty(metadata)
        .map_err(|e| format!("Failed to serialize metadata: {}", e))?;

    std::fs::write(&metadata_path, json).map_err(|e| format!("Failed to write metadata: {}", e))?;

    log::info!("Saved VPN metadata to {:?}", metadata_path);
    Ok(())
}

/// Load VPN metadata from disk
pub fn load_metadata(app_dir: &PathBuf) -> Option<VpnPersistedMetadata> {
    let metadata_path = app_dir.join(VPN_METADATA_FILE);

    if !metadata_path.exists() {
        return None;
    }

    let contents = std::fs::read_to_string(&metadata_path).ok()?;
    serde_json::from_str(&contents).ok()
}

/// Delete VPN config and metadata files
pub fn forget_device(app_dir: &PathBuf) -> Result<(), String> {
    let config_path = app_dir.join(format!("{}.conf", WG_INTERFACE));
    let metadata_path = app_dir.join(VPN_METADATA_FILE);

    let _ = std::fs::remove_file(&config_path);
    let _ = std::fs::remove_file(&metadata_path);

    log::info!("Deleted VPN config and metadata files");
    Ok(())
}
