/**
 * AI Performance Monitoring: Tracks health, latency, and model success rates.
 */
class AIMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulTools: 0,
      failedTools: 0,
      avgLatency: 0,
      modelStats: {}
    };
  }

  /**
   * Record a request lifecycle
   */
  recordRequest(model, latency, success) {
    this.metrics.totalRequests++;
    
    if (!this.metrics.modelStats[model]) {
      this.metrics.modelStats[model] = { count: 0, errors: 0 };
    }
    
    this.metrics.modelStats[model].count++;
    if (!success) this.metrics.modelStats[model].errors++;

    // Calculate rolling average latency
    this.metrics.avgLatency = (this.metrics.avgLatency * (this.metrics.totalRequests - 1) + latency) / this.metrics.totalRequests;
  }

  /**
   * Get realtime health stats
   */
  getHealthReport() {
    return {
      status: this.metrics.avgLatency < 5000 ? 'HEALTHY' : 'DEGRADED',
      ...this.metrics,
      timestamp: new Date()
    };
  }
}

module.exports = new AIMonitor();
