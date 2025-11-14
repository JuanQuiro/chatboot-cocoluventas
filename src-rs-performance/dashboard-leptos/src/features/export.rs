use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Formatos de exportación soportados
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum ExportFormat {
    CSV,
    JSON,
    PDF,
    Excel,
    Parquet,
}

/// Datos para exportar
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExportData {
    pub messages: Vec<Message>,
    pub statistics: Statistics,
    pub metadata: ExportMetadata,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub from: String,
    pub to: String,
    pub body: String,
    pub timestamp: i64,
    pub status: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Statistics {
    pub total_messages: u64,
    pub total_users: u64,
    pub avg_response_time: f64,
    pub success_rate: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExportMetadata {
    pub exported_at: i64,
    pub version: String,
    pub format: String,
}

/// Exportador de datos
pub struct DataExporter;

impl DataExporter {
    /// Exportar a CSV
    pub fn to_csv(data: &ExportData) -> Result<String, String> {
        let mut csv = String::from("ID,From,To,Body,Timestamp,Status\n");
        
        for msg in &data.messages {
            csv.push_str(&format!(
                "\"{}\",\"{}\",\"{}\",\"{}\",{},{}\n",
                msg.id, msg.from, msg.to, msg.body, msg.timestamp, msg.status
            ));
        }
        
        Ok(csv)
    }
    
    /// Exportar a JSON
    pub fn to_json(data: &ExportData) -> Result<String, String> {
        serde_json::to_string_pretty(data)
            .map_err(|e| format!("JSON error: {}", e))
    }
    
    /// Exportar a Excel (usando CSV como base)
    pub fn to_excel(data: &ExportData) -> Result<Vec<u8>, String> {
        let csv = Self::to_csv(data)?;
        // En producción, usar librería como xlsxwriter
        Ok(csv.into_bytes())
    }
    
    /// Exportar a Parquet (formato columnar)
    pub fn to_parquet(data: &ExportData) -> Result<Vec<u8>, String> {
        // En producción, usar librería parquet2
        let json = Self::to_json(data)?;
        Ok(json.into_bytes())
    }
}

/// Componente de exportación
use leptos::*;

#[component]
pub fn ExportPanel(data: Signal<ExportData>) -> impl IntoView {
    let (format, set_format) = create_signal(ExportFormat::CSV);
    let (exporting, set_exporting) = create_signal(false);
    
    let export = move |_| {
        set_exporting(true);
        let export_data = data();
        let export_format = format();
        
        spawn_local(async move {
            let result = match export_format {
                ExportFormat::CSV => DataExporter::to_csv(&export_data),
                ExportFormat::JSON => DataExporter::to_json(&export_data),
                ExportFormat::PDF => Err("PDF no implementado".to_string()),
                ExportFormat::Excel => DataExporter::to_excel(&export_data)
                    .map(|_| "Excel exportado".to_string()),
                ExportFormat::Parquet => DataExporter::to_parquet(&export_data)
                    .map(|_| "Parquet exportado".to_string()),
            };
            
            match result {
                Ok(content) => {
                    logging::log!("Export successful: {}", content.len());
                    // Descargar archivo
                    download_file(&format!("export.{:?}", export_format), &content);
                }
                Err(e) => logging::error!("Export error: {}", e),
            }
            
            set_exporting(false);
        });
    };
    
    view! {
        <div class="export-panel">
            <h3>"📥 Exportar Datos"</h3>
            
            <div class="format-selector">
                <label>
                    <input 
                        type="radio" 
                        name="format" 
                        value="csv"
                        on:change=move |_| set_format(ExportFormat::CSV)
                    />
                    "CSV"
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="format" 
                        value="json"
                        on:change=move |_| set_format(ExportFormat::JSON)
                    />
                    "JSON"
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="format" 
                        value="excel"
                        on:change=move |_| set_format(ExportFormat::Excel)
                    />
                    "Excel"
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="format" 
                        value="parquet"
                        on:change=move |_| set_format(ExportFormat::Parquet)
                    />
                    "Parquet"
                </label>
            </div>
            
            <button 
                on:click=export 
                disabled=exporting
                class="export-btn"
            >
                {move || if exporting() { "Exportando..." } else { "📥 Descargar" }}
            </button>
        </div>
    }
}

fn download_file(filename: &str, content: &str) {
    // Implementar descarga en navegador
    logging::log!("Downloading: {}", filename);
}
