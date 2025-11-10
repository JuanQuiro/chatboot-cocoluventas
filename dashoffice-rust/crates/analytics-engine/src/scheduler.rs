use tokio_cron_scheduler::{JobScheduler, Job};
use tracing::{info, error};
use std::sync::Arc;
use crate::aggregator::Aggregator;

pub struct AnalyticsScheduler {
    scheduler: JobScheduler,
    aggregator: Arc<Aggregator>,
}

impl AnalyticsScheduler {
    pub async fn new(aggregator: Aggregator) -> anyhow::Result<Self> {
        let scheduler = JobScheduler::new().await?;
        
        Ok(Self {
            scheduler,
            aggregator: Arc::new(aggregator),
        })
    }

    pub async fn start(&mut self) -> anyhow::Result<()> {
        info!("Starting analytics scheduler");

        // Job cada 5 minutos: agregar métricas
        let agg = self.aggregator.clone();
        let aggregate_job = Job::new_async("0 */5 * * * *", move |_uuid, _lock| {
            let agg = agg.clone();
            Box::pin(async move {
                info!("Running hourly aggregation");
                match agg.aggregate_hourly().await {
                    Ok(metrics) => info!("Aggregated {} metrics", metrics.len()),
                    Err(e) => error!("Aggregation failed: {}", e),
                }
            })
        })?;

        // Job cada hora: calcular KPIs
        let agg = self.aggregator.clone();
        let kpi_job = Job::new_async("0 0 * * * *", move |_uuid, _lock| {
            let agg = agg.clone();
            Box::pin(async move {
                info!("Calculating daily KPIs");
                match agg.calculate_daily_kpis().await {
                    Ok(kpis) => info!("KPIs calculated: {:?}", kpis),
                    Err(e) => error!("KPI calculation failed: {}", e),
                }
            })
        })?;

        self.scheduler.add(aggregate_job).await?;
        self.scheduler.add(kpi_job).await?;
        self.scheduler.start().await?;

        info!("Scheduler started successfully");
        Ok(())
    }

    pub async fn shutdown(&self) -> anyhow::Result<()> {
        self.scheduler.shutdown().await?;
        Ok(())
    }
}
