//! Domain categorization for interest matching

use std::collections::HashMap;

/// Domain to category mapping
pub struct CategoryMap {
    exact: HashMap<String, i32>,
    suffix: Vec<(String, i32)>,
}

/// Interest categories for dating
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(i32)]
pub enum Category {
    Unknown = 0,
    Gaming = 1,
    Fitness = 2,
    Music = 3,
    Movies = 4,
    Anime = 5,
    Cooking = 6,
    Travel = 7,
    Outdoors = 8,
    Tech = 9,
    Programming = 10,
    Finance = 11,
    Fashion = 12,
    Art = 13,
    Reading = 14,
    Podcasts = 15,
    Sports = 16,
    Pets = 17,
    Diy = 18,
    Photography = 19,
    News = 20,
    Social = 21,
    Shopping = 22,
    Streaming = 23,
    // Excluded from matching (sensitive)
    Health = 100,
    Adult = 101,
    Religion = 102,
    Politics = 103,
}

impl CategoryMap {
    /// Load category mappings (hardcoded for now, could load from DB/file)
    pub fn load() -> anyhow::Result<Self> {
        let mut exact = HashMap::new();
        let mut suffix = Vec::new();

        // Gaming
        for domain in ["steam.com", "steampowered.com", "epicgames.com", "twitch.tv",
                       "discord.com", "riotgames.com", "blizzard.com", "ea.com",
                       "xbox.com", "playstation.com", "nintendo.com", "itch.io"] {
            exact.insert(domain.to_string(), Category::Gaming as i32);
        }

        // Music
        for domain in ["spotify.com", "music.apple.com", "soundcloud.com", "bandcamp.com",
                       "last.fm", "genius.com", "shazam.com", "deezer.com"] {
            exact.insert(domain.to_string(), Category::Music as i32);
        }

        // Fitness
        for domain in ["strava.com", "myfitnesspal.com", "nike.com", "underarmour.com",
                       "peloton.com", "fitbit.com", "garmin.com"] {
            exact.insert(domain.to_string(), Category::Fitness as i32);
        }

        // Streaming / Movies
        for domain in ["netflix.com", "hulu.com", "disneyplus.com", "hbomax.com",
                       "primevideo.com", "imdb.com", "rottentomatoes.com", "letterboxd.com"] {
            exact.insert(domain.to_string(), Category::Streaming as i32);
        }

        // Anime
        for domain in ["crunchyroll.com", "funimation.com", "myanimelist.net",
                       "anilist.co", "vrv.co"] {
            exact.insert(domain.to_string(), Category::Anime as i32);
        }

        // Tech / Programming
        for domain in ["github.com", "stackoverflow.com", "gitlab.com", "bitbucket.org",
                       "hackernews.com", "news.ycombinator.com", "dev.to", "medium.com",
                       "techcrunch.com", "theverge.com", "arstechnica.com", "wired.com"] {
            exact.insert(domain.to_string(), Category::Tech as i32);
        }

        // Social
        for domain in ["twitter.com", "x.com", "facebook.com", "instagram.com",
                       "reddit.com", "tiktok.com", "snapchat.com", "linkedin.com"] {
            exact.insert(domain.to_string(), Category::Social as i32);
        }

        // Shopping
        for domain in ["amazon.com", "ebay.com", "etsy.com", "shopify.com",
                       "aliexpress.com", "walmart.com", "target.com"] {
            exact.insert(domain.to_string(), Category::Shopping as i32);
        }

        // News
        for domain in ["nytimes.com", "washingtonpost.com", "bbc.com", "cnn.com",
                       "reuters.com", "apnews.com", "theguardian.com"] {
            exact.insert(domain.to_string(), Category::News as i32);
        }

        // Travel
        for domain in ["airbnb.com", "booking.com", "expedia.com", "tripadvisor.com",
                       "kayak.com", "hotels.com", "vrbo.com"] {
            exact.insert(domain.to_string(), Category::Travel as i32);
        }

        // Finance
        for domain in ["robinhood.com", "coinbase.com", "binance.com", "kraken.com",
                       "fidelity.com", "schwab.com", "vanguard.com", "mint.com"] {
            exact.insert(domain.to_string(), Category::Finance as i32);
        }

        // Cooking
        for domain in ["allrecipes.com", "foodnetwork.com", "epicurious.com",
                       "seriouseats.com", "bonappetit.com", "tasty.co"] {
            exact.insert(domain.to_string(), Category::Cooking as i32);
        }

        // Reading
        for domain in ["goodreads.com", "kindle.amazon.com", "audible.com",
                       "scribd.com", "librarything.com"] {
            exact.insert(domain.to_string(), Category::Reading as i32);
        }

        // Podcasts
        for domain in ["podcasts.apple.com", "pocketcasts.com", "overcast.fm",
                       "castbox.fm", "anchor.fm"] {
            exact.insert(domain.to_string(), Category::Podcasts as i32);
        }

        // Sports
        for domain in ["espn.com", "nba.com", "nfl.com", "mlb.com",
                       "fifa.com", "uefa.com", "bleacherreport.com"] {
            exact.insert(domain.to_string(), Category::Sports as i32);
        }

        // Photography
        for domain in ["flickr.com", "500px.com", "unsplash.com", "pexels.com",
                       "adobe.com", "lightroom.adobe.com"] {
            exact.insert(domain.to_string(), Category::Photography as i32);
        }

        // Art
        for domain in ["deviantart.com", "artstation.com", "behance.net",
                       "dribbble.com", "pinterest.com"] {
            exact.insert(domain.to_string(), Category::Art as i32);
        }

        // Pets
        for domain in ["chewy.com", "petco.com", "petsmart.com", "akc.org"] {
            exact.insert(domain.to_string(), Category::Pets as i32);
        }

        // DIY
        for domain in ["instructables.com", "hackaday.com", "makezine.com",
                       "homedepot.com", "lowes.com"] {
            exact.insert(domain.to_string(), Category::Diy as i32);
        }

        // Suffix-based rules (less common)
        suffix.push((".edu".to_string(), Category::Reading as i32));
        suffix.push((".gov".to_string(), Category::News as i32));

        tracing::info!("Loaded {} exact domain mappings", exact.len());

        Ok(Self { exact, suffix })
    }

    /// Lookup category for a domain
    pub fn lookup(&self, domain: &str) -> Option<i32> {
        // Try exact match first
        if let Some(&cat) = self.exact.get(domain) {
            return Some(cat);
        }

        // Try suffix match
        for (sfx, cat) in &self.suffix {
            if domain.ends_with(sfx) {
                return Some(*cat);
            }
        }

        None
    }
}

/// Extract registrable domain (eTLD+1) from full domain
pub fn normalize_domain(domain: &str) -> String {
    // Use public suffix list for accurate eTLD+1 extraction
    match psl::domain_str(domain) {
        Some(d) => d.to_string(),
        None => {
            // Fallback: take last two parts
            let parts: Vec<&str> = domain.split('.').collect();
            if parts.len() >= 2 {
                format!("{}.{}", parts[parts.len() - 2], parts[parts.len() - 1])
            } else {
                domain.to_string()
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_domain() {
        assert_eq!(normalize_domain("api.spotify.com"), "spotify.com");
        assert_eq!(normalize_domain("www.reddit.com"), "reddit.com");
        assert_eq!(normalize_domain("foo.bar.github.io"), "bar.github.io");
    }
}
