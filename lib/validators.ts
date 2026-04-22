export const PROVIDER_VALIDATORS = {
  // --- 🌐 GENERAL CLOUD ---
  aws: {
    key: /^AKIA[0-9A-Z]{16}$/,
    secret: /^[A-Za-z0-9/+=]{40}$/
  },
  azure: {
    client_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  gcp: {
    is_json: (val: string) => {
      try {
        const p = JSON.parse(val);
        return p.type === "service_account" && !!p.project_id;
      } catch { return false; }
    }
  },

  // --- 🚀 GPU AI COMPUTE ---
  nvidia: {
    api_key: /^nvapi-[a-zA-Z0-9-_]{64,}$/
  },
  lambda: {
    api_key: /^live_[a-zA-Z0-9]{32,}$/
  },
  coreweave: {
    api_key: /^cw-sk-[a-zA-Z0-9]{32,}$/
  },

  // --- 🏛️ CLASSIC HPC ---
  ibm_hpc: {
    ssh_key: /-----BEGIN (RSA|OPENSSH) PRIVATE KEY-----/
  },
  oracle_hpc: {
    key: /^ocid1\.user\.oc1\..+$/
  },

  // --- ⚛️ QUANTUM QPU ---
  ionq: {
    api_key: /^[a-z0-9]{32,64}$/i
  },
  pasqal: {
    api_key: /^[a-zA-Z0-9\-_]{40,}$/
  },
  dwave: {
    api_key: /^DEV-[a-f0-9]{40}$/i
  },
  quantinuum: {
    api_key: /^[a-zA-Z0-9]{48,}$/
  }
};