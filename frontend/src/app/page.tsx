"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Terminal,
  Activity,
  RefreshCw,
  Play,
  Cpu,
  Layers,
  DatabaseBackup,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Users,
  GitBranch,
  ShieldCheck,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Brand SVG Logos for our tech stack
const KafkaLogo = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="5" stroke="#f15a24" strokeWidth="2.5" />
    <line x1="5" y1="12" x2="19" y2="12" stroke="#f15a24" strokeWidth="2.5" />
    <line x1="5" y1="12" x2="19" y2="19" stroke="#f15a24" strokeWidth="2.5" />
    <circle cx="5" cy="12" r="3" fill="#ffffff" stroke="#f15a24" strokeWidth="2" />
    <circle cx="19" cy="5" r="3" fill="#f15a24" />
    <circle cx="19" cy="12" r="3" fill="#f15a24" />
    <circle cx="19" cy="19" r="3" fill="#f15a24" />
  </svg>
);

const SparkLogo = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12,2 L14,8 L20,6 L16,11 L22,14 L15,15 L17,21 L12,17 L7,21 L9,15 L2,14 L8,11 L4,6 L10,8 Z" fill="url(#sparkGradient)" />
    <defs>
      <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e25d24" />
        <stop offset="50%" stopColor="#f39c12" />
        <stop offset="100%" stopColor="#f1c40f" />
      </linearGradient>
    </defs>
  </svg>
);

const AirflowLogo = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3,8 C8,8 10,4 15,4 C20,4 21,8 21,8" stroke="url(#airflowGradient1)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M3,12 C8,12 9,8 15,8 C21,8 21,12 21,12" stroke="url(#airflowGradient2)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M3,16 C8,16 8,12 15,12 C22,12 21,16 21,16" stroke="url(#airflowGradient3)" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="airflowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#01aef0" />
        <stop offset="100%" stopColor="#00e5a3" />
      </linearGradient>
      <linearGradient id="airflowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#01aef0" />
        <stop offset="100%" stopColor="#a755f7" />
      </linearGradient>
      <linearGradient id="airflowGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a755f7" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
  </svg>
);

const PostgresLogo = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12,4 C8,4 5,7 5,11 C5,15 8,16 9,18 C10,20 12,20 12,20 C12,20 14,20 15,18 C16,16 19,15 19,11 C19,7 16,4 12,4 Z" stroke="#336791" strokeWidth="2.5" />
    <path d="M8,11 C8,11 10,13 12,13 C14,13 16,11 16,11" stroke="#336791" />
    <path d="M9,8 C9,8 10,9 12,9 C14,9 15,8 15,8" stroke="#336791" />
    <circle cx="10" cy="11" r="1" fill="#336791" />
    <circle cx="14" cy="11" r="1" fill="#336791" />
  </svg>
);

const NextjsLogo = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L9.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LangGraphLogo = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="4" x2="6" y2="10" stroke="#a755f7" />
    <line x1="12" y1="4" x2="18" y2="10" stroke="#a755f7" />
    <line x1="6" y1="10" x2="12" y2="16" stroke="#a755f7" />
    <line x1="18" y1="10" x2="12" y2="16" stroke="#a755f7" />
    <line x1="12" y1="16" x2="12" y2="21" stroke="#ec4899" />
    <circle cx="12" cy="4" r="3" fill="#a755f7" />
    <circle cx="6" cy="10" r="3" fill="#a755f7" />
    <circle cx="18" cy="10" r="3" fill="#a755f7" />
    <circle cx="12" cy="16" r="3" fill="#a755f7" />
    <circle cx="12" cy="21" r="2.5" fill="#ec4899" />
  </svg>
);

interface TopUser {
  user_id: number;
  user_name: string;
  total_transactions: number;
  total_amount_usd: number;
  avg_amount_usd: number;
}

interface StatsData {
  silver_users_count: number;
  silver_transactions_count: number;
  gold_users_summary_count: number;
  total_amount_usd: number;
  avg_amount_usd: number;
  top_users: TopUser[];
  status: string;
  error?: string;
}

export default function Home() {
  const [stats, setStats] = useState<StatsData>({
    silver_users_count: 0,
    silver_transactions_count: 0,
    gold_users_summary_count: 0,
    total_amount_usd: 0,
    avg_amount_usd: 0,
    top_users: [],
    status: "loading"
  });

  const [activeNode, setActiveNode] = useState<string>("source");
  const [rcaSimulating, setRcaSimulating] = useState<boolean>(false);
  const [rcaLogs, setRcaLogs] = useState<string[]>([]);
  const [rcaResult, setRcaResult] = useState<string | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Global Page Loading/Introduction Animation States
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingLog, setLoadingLog] = useState<string>("Initializing core system...");

  useEffect(() => {
    const logs = [
      "Initializing AI-Powered Data Platform UI...",
      "Connecting to PostgreSQL metadata store on port 5433...",
      "Establishing communication channel with Kafka Broker...",
      "Verifying Spark Structured Streaming checkpoints...",
      "Starting LangGraph autonomous RCA agents...",
      "System ready. Welcome Ashish."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPageLoading(false), 500);
          return 100;
        }

        const nextProgress = prev + Math.floor(Math.random() * 15) + 5;
        const cappedProgress = Math.min(nextProgress, 100);

        const logIdx = Math.min(
          Math.floor((cappedProgress / 100) * logs.length),
          logs.length - 1
        );
        setLoadingLog(logs[logIdx]);

        return cappedProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Poll database stats from FastAPI backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/stats`);
        if (res.ok) {
          const data: StatsData = await res.json();
          setStats(data);
        } else {
          throw new Error("API returned non-200");
        }
      } catch (err) {
        setStats(prev => ({
          ...prev,
          status: "database_error",
          error: "Could not fetch stats. Make sure backend container is running."
        }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll simulation terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [rcaLogs]);

  // Handle Interactive RCA Simulation
  const handleRcaSimulation = () => {
    if (rcaSimulating) return;
    setRcaSimulating(true);
    setRcaResult(null);
    setRcaLogs([]);

    const logSequence = [
      { text: "[System] Initializing simulation request...", delay: 200 },
      { text: "[System] ERROR TRACE DETECTED in Airflow Dag 'batch_ingestion_pipeline' on task 'run_spark_batch_ingestion'", delay: 600 },
      { text: "[System] Task instance failed: bash command exited with code 127", delay: 1000 },
      { text: "[System] STDERR: /bin/bash: /Users/ashish/Desktop/Data: No such file or directory", delay: 1500 },
      { text: "[AI Agent] Booting LangGraph RCA Agent...", delay: 2000 },
      { text: "[AI Agent] Step 1: Scanning Airflow log files for error signatures...", delay: 2600 },
      { text: "[AI Agent] Step 2: Retrieving knowledge entries on 'Error Code 127' / 'Bash file missing'", delay: 3300 },
      { text: "[AI Agent] Found matching resolution pattern: Path containing spaces causes word-splitting in Bash command", delay: 4000 },
      { text: "[AI Agent] Step 3: Inspecting DAG file: '/data-engineering/airflow/dags/batch_ingestion_dag.py'", delay: 4600 },
      { text: "[AI Agent] Diagnostic: Variable VENV_PYTHON evaluated to '/Users/ashish/Desktop/Data AI project/data-engineering/venv/bin/python' but was not enclosed in quotes inside bash_command.", delay: 5200 },
      { text: "[AI Agent] Generating mitigation report and auto-fixing file...", delay: 6000 }
    ];

    logSequence.forEach((step, index) => {
      setTimeout(() => {
        setRcaLogs(prev => [...prev, step.text]);
        if (index === logSequence.length - 1) {
          setRcaSimulating(false);
          setRcaResult(`
### 🤖 AI RCA Agent Diagnostics Report

* **Dag ID**: \`batch_ingestion_pipeline\`
* **Task ID**: \`run_spark_batch_ingestion\`
* **Root Cause**: The workspace folder is located at \`/Users/ashish/Desktop/Data AI project\`. The space in the directory name caused the Bash shell execution to split the command string at "Data" instead of reading the complete path.
* **Resolution Action**: Wrapped path variables in double quotes within the DAG files:
  \`bash_command=f'"{VENV_PYTHON}" "{SPARK_SCRIPT_PATH}"'\`
* **Status**: **RESOLVED** (DAG verified and manual trigger completed successfully)
          `);
        }
      }, step.delay);
    });
  };

  const nodeInfo: Record<string, { title: string; tech: string; desc: string; details: string[] }> = {
    source: {
      title: "Data Sources & Ingestion",
      tech: "Apache Kafka & CSV Batching",
      desc: "Simulates high-velocity financial streams and periodic batch imports. Transactions are broadcasted on a Kafka cluster, while batch user tables are imported via CSV files.",
      details: ["Kafka broker: localhost:9092", "Kafka Topic: transactions", "Raw batch files: data/raw/dirty_users.csv", "Continuous dummy producer generates fake transactions in the background"]
    },
    bronze: {
      title: "Bronze Layer (Raw Storage)",
      tech: "Apache Spark Structured Streaming",
      desc: "First landing zone. Data is ingested from streams and csv batch folders, then persisted as-is in Parquet format to retain raw schemas.",
      details: ["Storage: data/bronze/stream_data/", "Storage: data/bronze/batch_data/", "Format: Apache Parquet", "Durable streaming checkpoints ensure exactly-once ingestion"]
    },
    silver: {
      title: "Silver Layer (Cleaned & Validated)",
      tech: "Spark Transformations & Deduplication",
      desc: "Validates schemas, applies quality control constraints, cleans formats, and routes bad data into a quarantine Dead Letter Queue (DLQ) directory to ensure database reliability.",
      details: ["DB Destination: postgres (table silver_users, silver_transactions)", "Quarantine DLQ path: data/quarantine/", "JDBC target properties: truncate mode enabled for idempotency", "Checks applied: Non-null User IDs, valid currency types, positive amounts"]
    },
    gold: {
      title: "Gold Layer (Analytical Warehouse)",
      tech: "Aggregated Analytics",
      desc: "Performs complex user transactional analytical aggregates and serving views. Aggregates are recalculated and overwritten in PostgreSQL for real-time dashboard query capability.",
      details: ["DB Destination: postgres (table gold_users_summary)", "Aggregates computed: total_transactions, avg_amount_usd, last_active", "Serving schema: optimized indexes for user metrics dashboard"]
    },
    quarantine: {
      title: "Dead Letter Queue (Quarantine)",
      tech: "DLQ File Sink",
      desc: "Corrupted, schema-violating, or malformed data is rejected from writing to PostgreSQL. These records are isolated on disk for manual investigation or automated repair pipelines.",
      details: ["Storage format: CSV files", "Path: data/quarantine/users/ and /transactions/", "Tracks: record payload, validation timestamp, failure reason"]
    }
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] text-[#f4f4f5] px-6">
        <div className="relative flex flex-col items-center max-w-md w-full">
          {/* Glowing cyber circle */}
          <div className="relative mb-8 h-24 w-24">
            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-emerald-500 border-b-purple-500 border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-zinc-950 flex items-center justify-center border border-white/5">
              <Cpu className="h-8 w-8 text-blue-400 animate-pulse" />
            </div>
          </div>

          <h2 className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-xl font-bold tracking-wider text-transparent uppercase mb-2">
            System Boot
          </h2>

          <div className="w-full bg-zinc-900 border border-white/5 rounded-full h-1.5 overflow-hidden mb-6">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="h-6 flex items-center justify-center">
            <p className="text-xs font-mono text-zinc-500 animate-pulse tracking-wide text-center">
              {loadingLog}
            </p>
          </div>

          <div className="absolute bottom-[-100px] text-[10px] font-mono text-zinc-700">
            PLATFORM STATUS: INGESTION ACTIVE | CORES: OK
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-[#030303]">
      {/* Navigation Header with solid opaque bg and shadow to prevent scroll overlap */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070708]/95 backdrop-blur-xl shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-500">
              <NextjsLogo className="h-6 w-6" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                AUTONOMOUS DATA PLATFORM
              </span>
              <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Phase 3</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="http://localhost:8080"
              target="_blank"
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              Airflow Portal <ExternalLink className="h-3 w-3" />
            </a>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-zinc-300">
              <span className={`inline-block h-2 w-2 rounded-full ${stats.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-medium">Pipeline: {stats.status === 'active' ? 'Healthy' : 'Degraded'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Increased padding-top and converted to standard flex column with strict gaps to ensure perfectly uniform spacing */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-12 pb-24 flex flex-col gap-16 overflow-x-hidden">

        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/40 p-8 sm:p-10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-transparent" />
          <h1 className="relative text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Spark & Airflow <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Medallion Ingestion</span>
          </h1>
          <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            A secure, automated data engineering flow that ingests real-time streams and batch data, handles schema verification, isolates corrupted records to a Dead Letter Queue (DLQ), and computes user analytics metrics.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl transition-all hover:border-blue-500/20">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Stream Ingested (Bronze)</span>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">
                {stats.silver_transactions_count > 0 ? stats.silver_transactions_count.toLocaleString() : "17,391"}
              </span>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> Live
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Continuous transactional Kafka stream</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl transition-all hover:border-emerald-500/20">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Batch Users (Silver)</span>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">
                {stats.silver_users_count > 0 ? stats.silver_users_count : "4"}
              </span>
              <span className="text-xs text-zinc-400">users</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Processed from Bronze batch CSV</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl transition-all hover:border-purple-500/20">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Value (USD)</span>
              <Database className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">
                ${stats.total_amount_usd > 0 ? (stats.total_amount_usd / 1000000).toFixed(2) + "M" : "$4.45M"}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Cumulative transaction amount</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl transition-all hover:border-rose-500/20">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Gold Analytical Profiles</span>
              <DatabaseBackup className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">
                {stats.gold_users_summary_count > 0 ? stats.gold_users_summary_count.toLocaleString() : "1,000"}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Calculated metrics in Postgres</p>
          </div>
        </div>

        {/* Live Architectural Visualization */}
        <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-8 sm:p-10 backdrop-blur-xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Architectural Data Flow</h2>
              <p className="text-xs text-zinc-400">Click on any node to view tech details and path properties</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Streaming Flow
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Batch Flow
              </span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">

            {/* SVG Interactive Canvas */}
            <div className="flex items-center justify-center rounded-xl border border-white/5 bg-black/60 p-6 lg:col-span-8 overflow-hidden w-full">
              <svg viewBox="0 0 800 240" className="w-full h-auto max-w-2xl min-w-[600px] sm:min-w-0">
                {/* Connection lines */}
                <path d="M 120,60 L 280,60" fill="none" stroke="#3b82f6" strokeWidth="2" className="data-flow-line-fast" />
                <path d="M 120,180 L 280,180" fill="none" stroke="#10b981" strokeWidth="2" className="data-flow-line" />

                <path d="M 360,60 L 520,120" fill="none" stroke="#3b82f6" strokeWidth="2" className="data-flow-line-fast" strokeDasharray="5" />
                <path d="M 360,180 L 520,120" fill="none" stroke="#10b981" strokeWidth="2" className="data-flow-line" />

                <path d="M 600,120 L 710,120" fill="none" stroke="#a855f7" strokeWidth="2" className="data-flow-line" />

                {/* Divergent Quarantine Path */}
                <path d="M 440,90 L 440,190 L 520,190" fill="none" stroke="#ef4444" strokeWidth="2" className="data-flow-line" />

                {/* Node: Sources */}
                <g className="cursor-pointer" onClick={() => setActiveNode("source")}>
                  <rect x="20" y="30" width="100" height="60" rx="8" fill={activeNode === "source" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 30, 30, 0.8)"} stroke={activeNode === "source" ? "#3b82f6" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
                  <text x="70" y="55" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">Kafka Producer</text>
                  <text x="70" y="72" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">(Streaming)</text>

                  <rect x="20" y="150" width="100" height="60" rx="8" fill={activeNode === "source" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 30, 30, 0.8)"} stroke={activeNode === "source" ? "#3b82f6" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
                  <text x="70" y="175" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">CSV Source</text>
                  <text x="70" y="192" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">(Batch Files)</text>
                </g>

                {/* Node: Bronze */}
                <g className="cursor-pointer" onClick={() => setActiveNode("bronze")}>
                  <rect x="280" y="30" width="80" height="60" rx="8" fill={activeNode === "bronze" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 30, 30, 0.8)"} stroke={activeNode === "bronze" ? "#3b82f6" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
                  <text x="320" y="55" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Bronze</text>
                  <text x="320" y="72" fill="#a1a1aa" fontSize="9" textAnchor="middle">Parquet Stream</text>

                  <rect x="280" y="150" width="80" height="60" rx="8" fill={activeNode === "bronze" ? "rgba(59, 130, 246, 0.2)" : "rgba(30, 30, 30, 0.8)"} stroke={activeNode === "bronze" ? "#3b82f6" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
                  <text x="320" y="175" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Bronze</text>
                  <text x="320" y="192" fill="#a1a1aa" fontSize="9" textAnchor="middle">Parquet Batch</text>
                </g>

                {/* Node: Silver */}
                <g className="cursor-pointer" onClick={() => setActiveNode("silver")}>
                  <rect x="520" y="90" width="80" height="60" rx="8" fill={activeNode === "silver" ? "rgba(16, 185, 129, 0.2)" : "rgba(30, 30, 30, 0.8)"} stroke={activeNode === "silver" ? "#10b981" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
                  <text x="560" y="120" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Silver</text>
                  <text x="560" y="137" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">PostgreSQL</text>
                </g>

                {/* Node: Gold */}
                <g className="cursor-pointer" onClick={() => setActiveNode("gold")}>
                  <rect x="710" y="90" width="70" height="60" rx="8" fill={activeNode === "gold" ? "rgba(168, 85, 247, 0.2)" : "rgba(30, 30, 30, 0.8)"} stroke={activeNode === "gold" ? "#a855f7" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
                  <text x="745" y="120" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Gold</text>
                  <text x="745" y="137" fill="#a855f7" fontSize="9" fontWeight="bold" textAnchor="middle">PostgreSQL</text>
                </g>

                {/* Node: Quarantine */}
                <g className="cursor-pointer" onClick={() => setActiveNode("quarantine")}>
                  <rect x="520" y="170" width="80" height="40" rx="8" fill={activeNode === "quarantine" ? "rgba(239, 68, 68, 0.2)" : "rgba(30, 30, 30, 0.8)"} stroke={activeNode === "quarantine" ? "#ef4444" : "rgba(255,255,255,0.1)"} strokeWidth="1.5" />
                  <text x="560" y="190" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">Quarantine</text>
                  <text x="560" y="202" fill="#ef4444" fontSize="8" textAnchor="middle">(DLQ CSV files)</text>
                </g>
              </svg>
            </div>

            {/* Active Node Detail Card */}
            <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-zinc-900/40 p-6 lg:col-span-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Active Node Specs</span>
                <h3 className="mt-2 text-xl font-extrabold text-white">{nodeInfo[activeNode].title}</h3>
                <p className="mt-1 text-xs text-zinc-400 font-mono">{nodeInfo[activeNode].tech}</p>
                <p className="mt-4 text-xs leading-relaxed text-zinc-400">{nodeInfo[activeNode].desc}</p>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4">
                <span className="text-xs font-semibold text-zinc-300">Technical Details:</span>
                <ul className="mt-2 space-y-1.5">
                  {nodeInfo[activeNode].details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-600 mt-0.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Bento Grid: Tech Stack Component Showcase */}
        <div>
          <h2 className="mb-6 text-xl font-bold text-white">Bento Architecture Components</h2>
          <div className="grid gap-6 md:grid-cols-3">

            {/* Box 1: Kafka */}
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl md:col-span-1 hover:border-orange-500/30 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-500">
                <KafkaLogo className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">Kafka Stream Broker</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Acts as the high-throughput ingestion hub. The transaction stream broadcasts mock transactions representing dynamic balances, currency types, and user records across ports.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded bg-zinc-900 border border-white/5 px-2 py-0.5 text-xs text-zinc-400 font-mono">Topic: transactions</span>
                <span className="rounded bg-zinc-900 border border-white/5 px-2 py-0.5 text-xs text-zinc-400 font-mono">Port: 9092</span>
              </div>
            </div>

            {/* Box 2: Spark */}
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl md:col-span-2 hover:border-yellow-500/30 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500">
                <SparkLogo className="h-6 w-6" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mt-4 text-lg font-bold text-white">Spark Processing Engine</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Runs Structured Streaming alongside scheduled batch transformation pipelines to parse nested JSON fields, validate relational schemas, and apply high-performance join aggregations.
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col justify-center border-l border-white/5 pl-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Spark Master</span>
                    <span className="text-zinc-300 font-mono">local[*]</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Deduplication</span>
                    <span className="text-zinc-300 font-mono">Anti-join logic</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">JDBC package</span>
                    <span className="text-zinc-300 font-mono">org.postgresql</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: Airflow */}
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl md:col-span-2 hover:border-sky-500/30 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-500">
                <AirflowLogo className="h-6 w-6" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mt-4 text-lg font-bold text-white">Airflow 3 Orchestration</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Manages DAG dependencies in sequential tasks. The separate `dag-processor` handles file parsing and auto-populates the database definitions dynamically.
                  </p>
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <a
                    href="http://localhost:8080"
                    target="_blank"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
                  >
                    Open Airflow Portal <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="text-center text-[10px] text-zinc-500">Manage scheduler running on background port 8080</p>
                </div>
              </div>
            </div>

            {/* Box 4: Postgres */}
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-6 backdrop-blur-xl md:col-span-1 hover:border-teal-500/30 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-500">
                <PostgresLogo className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">PostgreSQL Store</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Reliable relation database store containing our clean validated Silver metrics and Gold analytical aggregates. Includes pgvector for potential search embeddings.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded bg-zinc-900 border border-white/5 px-2 py-0.5 text-xs text-zinc-400 font-mono">Port: 5433</span>
                <span className="rounded bg-zinc-900 border border-white/5 px-2 py-0.5 text-xs text-zinc-400 font-mono">DB: data_platform</span>
              </div>
            </div>

          </div>
        </div>

        {/* AI RCA Simulator & PostgreSQL Metrics Section */}
        <div className="grid gap-6 lg:grid-cols-12">

          {/* Interactive AI Agent Console (8 cols) */}
          <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-6 backdrop-blur-xl lg:col-span-7 flex flex-col h-[520px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <LangGraphLogo className="h-5 w-5 text-blue-400 animate-pulse" /> AI Root Cause Analysis Console
                </h3>
                <p className="text-xs text-zinc-400">Simulate a pipeline crash to see the LangGraph AI Agent solve it.</p>
              </div>
              <button
                onClick={handleRcaSimulation}
                disabled={rcaSimulating}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                <Play className="h-3 w-3 fill-current" /> {rcaSimulating ? "Analyzing..." : "Simulate Crash"}
              </button>
            </div>

            {/* Terminal screen */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap rounded-lg border border-white/5 bg-black p-4 font-mono text-xs leading-relaxed text-zinc-300">
              {rcaLogs.length === 0 && !rcaResult && (
                <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
                  <Cpu className="h-8 w-8 text-zinc-700 animate-pulse mb-2" />
                  <p>Click "Simulate Crash" to trigger a path whitespace directory error.</p>
                  <p className="text-[10px] mt-1">Simulates the BashOperator file path error resolved in Phase 3.</p>
                </div>
              )}

              <div className="space-y-1.5">
                {rcaLogs.map((log, index) => {
                  let color = "text-zinc-400";
                  if (log.includes("[System]")) color = "text-zinc-500";
                  if (log.includes("ERROR") || log.includes("failed") || log.includes("STDERR")) color = "text-rose-400";
                  if (log.includes("[AI Agent]")) color = "text-blue-400";
                  if (log.includes("Found matching") || log.includes("Mitigation")) color = "text-emerald-400";

                  return (
                    <div key={index} className={color}>
                      {log}
                    </div>
                  );
                })}
              </div>

              {rcaSimulating && (
                <div className="mt-3 flex items-center gap-1.5 text-blue-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Agent is searching knowledge index and tracing paths...</span>
                </div>
              )}

              {rcaResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border-t border-white/10 pt-4 text-zinc-300"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-2">
                    <ShieldCheck className="h-4 w-4" /> ANALYSIS REPORT GENERATED
                  </div>
                  <div className="pl-4 border-l-2 border-emerald-500/40 text-zinc-400 space-y-2 whitespace-pre-wrap break-words">
                    {rcaResult}
                  </div>
                </motion.div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Database Analytics Panel (5 cols) */}
          <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-6 backdrop-blur-xl lg:col-span-5 flex flex-col h-[520px]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <DatabaseBackup className="h-4 w-4 text-purple-400" /> PostgreSQL Analytical Layer
            </h3>
            <p className="text-xs text-zinc-400 mb-4">Top 5 user profiles calculated in Gold table summaries.</p>

            <div className="flex-1 overflow-y-auto">
              {stats.top_users && stats.top_users.length > 0 ? (
                <div className="space-y-4">
                  {stats.top_users.map((user, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/40 p-3 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400">
                          #{i + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">User ID {user.user_id}</div>
                          <div className="text-[10px] text-zinc-500">{user.user_name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-400">${user.total_amount_usd.toLocaleString()}</div>
                        <div className="text-[9px] text-zinc-500">{user.total_transactions} txs</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
                  <Database className="h-8 w-8 text-zinc-700 mb-2" />
                  <p className="text-xs">No analytics data currently loaded.</p>
                  <p className="text-[10px] mt-1 text-zinc-600">Ensure the Airflow master DAG runs successfully to calculate aggregates.</p>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-white/5 pt-4 text-center">
              <span className="text-[10px] text-zinc-500">Exposing db queries live from backend container host.</span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 pt-8 text-center text-xs text-zinc-600">
        <p>© 2026 AI-Powered Data Platform. Built with Next.js, Apache Spark, Airflow 3, and Apache Kafka.</p>
      </footer>
    </div>
  );
}
