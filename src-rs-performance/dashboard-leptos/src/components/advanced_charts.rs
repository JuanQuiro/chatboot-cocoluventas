use leptos::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Datos para gráficos avanzados
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ChartData {
    pub labels: Vec<String>,
    pub datasets: Vec<Dataset>,
    pub timestamp: i64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Dataset {
    pub label: String,
    pub data: Vec<f64>,
    pub color: String,
    pub trend: TrendType,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum TrendType {
    Up,
    Down,
    Stable,
}

/// Componente de gráfico de líneas
#[component]
pub fn LineChart(
    #[prop(default = "Gráfico de Líneas".to_string())]
    title: String,
    data: Signal<ChartData>,
) -> impl IntoView {
    let canvas_id = format!("chart-{}", uuid::Uuid::new_v4());
    
    create_effect(move |_| {
        let chart_data = data();
        spawn_local(async move {
            // Renderizar gráfico con canvas
            if let Some(canvas) = web_sys::window()
                .and_then(|w| w.document())
                .and_then(|d| d.get_element_by_id(&canvas_id))
            {
                logging::log!("Rendering chart: {}", title);
            }
        });
    });
    
    view! {
        <div class="chart-container">
            <h3>{title}</h3>
            <canvas id=canvas_id class="chart-canvas"></canvas>
        </div>
    }
}

/// Componente de gráfico de barras
#[component]
pub fn BarChart(
    #[prop(default = "Gráfico de Barras".to_string())]
    title: String,
    data: Signal<ChartData>,
) -> impl IntoView {
    view! {
        <div class="chart-container">
            <h3>{title}</h3>
            <div class="bar-chart">
                <For each=move || data().datasets key=|d| d.label.clone() let:dataset>
                    <div class="bar-group">
                        <For each=move || dataset.data.clone() key=|v| (*v as i32) let:value>
                            <div 
                                class="bar" 
                                style=format!("height: {}%; background: {}", value, dataset.color)
                            ></div>
                        </For>
                    </div>
                </For>
            </div>
        </div>
    }
}

/// Componente de gráfico de pastel
#[component]
pub fn PieChart(
    #[prop(default = "Gráfico de Pastel".to_string())]
    title: String,
    data: Signal<ChartData>,
) -> impl IntoView {
    let total = move || {
        data()
            .datasets
            .iter()
            .flat_map(|d| &d.data)
            .sum::<f64>()
    };
    
    view! {
        <div class="chart-container">
            <h3>{title}</h3>
            <div class="pie-chart">
                <For each=move || data().datasets key=|d| d.label.clone() let:dataset>
                    <div class="pie-segment">
                        <div class="percentage">
                            {move || format!("{:.1}%", (dataset.data.iter().sum::<f64>() / total()) * 100.0)}
                        </div>
                        <div class="label">{dataset.label}</div>
                    </div>
                </For>
            </div>
        </div>
    }
}

/// Componente de heatmap
#[component]
pub fn HeatMap(
    #[prop(default = "Mapa de Calor".to_string())]
    title: String,
    data: Signal<Vec<Vec<f64>>>,
) -> impl IntoView {
    view! {
        <div class="chart-container">
            <h3>{title}</h3>
            <div class="heatmap">
                <For each=move || data() key=|row| format!("{:?}", row) let:row>
                    <div class="heatmap-row">
                        <For each=move || row.clone() key=|v| (*v as i32) let:value>
                            <div 
                                class="heatmap-cell"
                                style=format!(
                                    "background: rgba(255, 0, 0, {})",
                                    value / 100.0
                                )
                            >
                                {value}
                            </div>
                        </For>
                    </div>
                </For>
            </div>
        </div>
    }
}

/// Estadísticas avanzadas
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AdvancedStats {
    pub mean: f64,
    pub median: f64,
    pub std_dev: f64,
    pub min: f64,
    pub max: f64,
    pub percentile_95: f64,
    pub percentile_99: f64,
}

impl AdvancedStats {
    pub fn calculate(data: &[f64]) -> Self {
        if data.is_empty() {
            return Self {
                mean: 0.0,
                median: 0.0,
                std_dev: 0.0,
                min: 0.0,
                max: 0.0,
                percentile_95: 0.0,
                percentile_99: 0.0,
            };
        }
        
        let mean = data.iter().sum::<f64>() / data.len() as f64;
        let variance = data.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / data.len() as f64;
        let std_dev = variance.sqrt();
        
        let mut sorted = data.to_vec();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
        
        let median = if sorted.len() % 2 == 0 {
            (sorted[sorted.len() / 2 - 1] + sorted[sorted.len() / 2]) / 2.0
        } else {
            sorted[sorted.len() / 2]
        };
        
        let percentile_95 = sorted[(sorted.len() as f64 * 0.95) as usize];
        let percentile_99 = sorted[(sorted.len() as f64 * 0.99) as usize];
        
        Self {
            mean,
            median,
            std_dev,
            min: sorted[0],
            max: sorted[sorted.len() - 1],
            percentile_95,
            percentile_99,
        }
    }
}

/// Componente de estadísticas
#[component]
pub fn StatsPanel(stats: Signal<AdvancedStats>) -> impl IntoView {
    view! {
        <div class="stats-panel">
            <div class="stat-item">
                <span class="label">Media:</span>
                <span class="value">{move || format!("{:.2}", stats().mean)}</span>
            </div>
            <div class="stat-item">
                <span class="label">Mediana:</span>
                <span class="value">{move || format!("{:.2}", stats().median)}</span>
            </div>
            <div class="stat-item">
                <span class="label">Desv. Est:</span>
                <span class="value">{move || format!("{:.2}", stats().std_dev)}</span>
            </div>
            <div class="stat-item">
                <span class="label">Min:</span>
                <span class="value">{move || format!("{:.2}", stats().min)}</span>
            </div>
            <div class="stat-item">
                <span class="label">Max:</span>
                <span class="value">{move || format!("{:.2}", stats().max)}</span>
            </div>
            <div class="stat-item">
                <span class="label">P95:</span>
                <span class="value">{move || format!("{:.2}", stats().percentile_95)}</span>
            </div>
            <div class="stat-item">
                <span class="label">P99:</span>
                <span class="value">{move || format!("{:.2}", stats().percentile_99)}</span>
            </div>
        </div>
    }
}
