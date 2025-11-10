use std::collections::HashMap;
use regex::Regex;

pub struct NLPProcessor {
    stop_words: Vec<String>,
}

impl NLPProcessor {
    pub fn new() -> Self {
        Self {
            stop_words: vec![
                "el", "la", "de", "que", "y", "a", "en", "un", "ser", "se", "no",
                "haber", "por", "con", "su", "para", "como", "estar", "tener",
            ]
            .into_iter()
            .map(|s| s.to_string())
            .collect(),
        }
    }

    pub fn tokenize(&self, text: &str) -> Vec<String> {
        text.split_whitespace()
            .map(|s| s.to_lowercase())
            .filter(|s| !self.stop_words.contains(s))
            .collect()
    }

    pub fn extract_keywords(&self, text: &str) -> Vec<String> {
        let tokens = self.tokenize(text);
        let mut frequency: HashMap<String, usize> = HashMap::new();

        for token in tokens {
            *frequency.entry(token).or_insert(0) += 1;
        }

        let mut keywords: Vec<_> = frequency.into_iter().collect();
        keywords.sort_by(|a, b| b.1.cmp(&a.1));

        keywords.into_iter().take(5).map(|(k, _)| k).collect()
    }

    pub fn extract_phone_numbers(&self, text: &str) -> Vec<String> {
        let re = Regex::new(r"\b\d{10}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b").unwrap();
        re.find_iter(text)
            .map(|m| m.as_str().to_string())
            .collect()
    }

    pub fn extract_emails(&self, text: &str) -> Vec<String> {
        let re = Regex::new(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b").unwrap();
        re.find_iter(text)
            .map(|m| m.as_str().to_string())
            .collect()
    }

    pub fn calculate_similarity(&self, text1: &str, text2: &str) -> f32 {
        let tokens1: Vec<_> = self.tokenize(text1);
        let tokens2: Vec<_> = self.tokenize(text2);

        let set1: std::collections::HashSet<_> = tokens1.iter().collect();
        let set2: std::collections::HashSet<_> = tokens2.iter().collect();

        let intersection = set1.intersection(&set2).count();
        let union = set1.union(&set2).count();

        if union == 0 {
            0.0
        } else {
            intersection as f32 / union as f32
        }
    }
}
