# Pattern 13: Doctor Health Checks

**Effort:** 1-2 days | **Impact:** Medium | **Level:** Full System  
**Source:** [05-eval-methodology.md](../05-eval-methodology.md)

---

## The Problem

Environment issues cause mysterious failures:
- Missing dependencies
- Invalid configuration
- Expired API keys
- Outdated versions
- Broken tool integrations

Better to catch them early than debug cryptically.

---

## The Solution

Validate the entire environment before running with a `doctor` command.

---

## Architecture

```
$ myapp doctor
        ↓
Run all health checks:
├── Installation checks
├── Configuration checks
├── Authentication checks
├── Dependency checks
├── Tool checks
└── Update checks
        ↓
Display results:
✅ OpenCode installed
✅ Configuration valid
⚠️ Google API key missing (optional)
❌ AST-Grep not found
        ↓
Exit code: 0 (all pass) or 1 (critical failure)
```

---

## Check Categories

```typescript
type CheckCategory =
  | "installation"    // Main tool, plugins installed
  | "configuration"   // Config file valid, schema passes
  | "authentication"  // API keys configured and valid
  | "dependencies"    // Required binaries present
  | "tools"           // LSP, MCP servers working
  | "updates"         // Version comparison
```

---

## Check Definition Interface

```typescript
type CheckStatus = "pass" | "fail" | "warn" | "skip"

interface CheckResult {
  name: string
  status: CheckStatus
  message: string
  details?: string[]
  duration?: number
}

interface CheckDefinition {
  id: string
  name: string
  category: CheckCategory
  check: () => Promise<CheckResult>
  critical?: boolean  // If true, failure = exit code 1
}
```

---

## Implementation

### Check Registry

```typescript
function getAllCheckDefinitions(): CheckDefinition[] {
  return [
    // Installation
    getMainToolCheckDefinition(),
    getPluginCheckDefinition(),
    
    // Configuration
    getConfigCheckDefinition(),
    getModelResolutionCheckDefinition(),
    
    // Authentication
    ...getAuthCheckDefinitions(),
    
    // Dependencies
    ...getDependencyCheckDefinitions(),
    
    // Tools
    getLspCheckDefinition(),
    ...getMcpCheckDefinitions(),
    
    // Updates
    getVersionCheckDefinition(),
  ]
}
```

### Configuration Check Example

```typescript
function getConfigCheckDefinition(): CheckDefinition {
  return {
    id: "config-valid",
    name: "Configuration Valid",
    category: "configuration",
    critical: true,
    
    check: async () => {
      const configPath = getConfigPath()
      
      if (!existsSync(configPath)) {
        return {
          name: "Configuration Valid",
          status: "fail",
          message: "Config file not found",
          details: [`Expected at: ${configPath}`]
        }
      }
      
      try {
        const content = readFileSync(configPath, "utf-8")
        const config = parseJsonc(content)
        const result = ConfigSchema.safeParse(config)
        
        if (!result.success) {
          return {
            name: "Configuration Valid",
            status: "fail",
            message: "Config validation failed",
            details: result.error.issues.map(
              i => `${i.path.join(".")}: ${i.message}`
            )
          }
        }
        
        return {
          name: "Configuration Valid",
          status: "pass",
          message: "Config is valid"
        }
      } catch (err) {
        return {
          name: "Configuration Valid",
          status: "fail",
          message: err.message
        }
      }
    }
  }
}
```

### Auth Check Example

```typescript
function getAuthCheckDefinitions(): CheckDefinition[] {
  return [
    {
      id: "auth-anthropic",
      name: "Anthropic API Key",
      category: "authentication",
      critical: true,
      
      check: async () => {
        const key = process.env.ANTHROPIC_API_KEY
        
        if (!key) {
          return {
            name: "Anthropic API Key",
            status: "fail",
            message: "ANTHROPIC_API_KEY not set"
          }
        }
        
        if (!key.startsWith("sk-ant-")) {
          return {
            name: "Anthropic API Key",
            status: "warn",
            message: "API key format looks unusual"
          }
        }
        
        return {
          name: "Anthropic API Key",
          status: "pass",
          message: "API key configured"
        }
      }
    },
    
    {
      id: "auth-openai",
      name: "OpenAI API Key",
      category: "authentication",
      critical: false,  // Optional
      
      check: async () => {
        const key = process.env.OPENAI_API_KEY
        
        if (!key) {
          return {
            name: "OpenAI API Key",
            status: "skip",
            message: "Not configured (optional)"
          }
        }
        
        return {
          name: "OpenAI API Key",
          status: "pass",
          message: "API key configured"
        }
      }
    }
  ]
}
```

### Dependency Check Example

```typescript
function getDependencyCheckDefinitions(): CheckDefinition[] {
  return [
    {
      id: "dep-ast-grep",
      name: "AST-Grep",
      category: "dependencies",
      critical: false,
      
      check: async () => {
        try {
          const result = await exec("ast-grep --version")
          const version = result.stdout.trim()
          
          return {
            name: "AST-Grep",
            status: "pass",
            message: `Installed (${version})`
          }
        } catch {
          return {
            name: "AST-Grep",
            status: "warn",
            message: "Not installed",
            details: ["Install with: cargo install ast-grep"]
          }
        }
      }
    }
  ]
}
```

---

## Runner

```typescript
async function runDoctor(): Promise<number> {
  const checks = getAllCheckDefinitions()
  const results: CheckResult[] = []
  
  for (const check of checks) {
    const start = Date.now()
    
    try {
      const result = await check.check()
      result.duration = Date.now() - start
      results.push(result)
      displayResult(result)
    } catch (err) {
      results.push({
        name: check.name,
        status: "fail",
        message: `Check threw error: ${err.message}`,
        duration: Date.now() - start
      })
    }
  }
  
  return determineExitCode(results)
}

function determineExitCode(results: CheckResult[]): number {
  const hasCriticalFailure = results.some(r => 
    r.status === "fail" && 
    getAllCheckDefinitions()
      .find(c => c.name === r.name)?.critical
  )
  
  return hasCriticalFailure ? 1 : 0
}
```

---

## Display Format

```
$ myapp doctor

Installation
  ✅ Main Tool .................. Installed (v3.1.3)
  ✅ Plugin ..................... Registered

Configuration
  ✅ Config File ................ Valid
  ✅ Model Resolution ........... All models resolve

Authentication
  ✅ Anthropic API Key .......... Configured
  ⚠️ OpenAI API Key ............. Not configured (optional)
  ⚠️ Google API Key ............. Not configured (optional)

Dependencies
  ✅ AST-Grep ................... v0.12.5
  ❌ Comment Checker ............ Not found
     └─ Install with: bun add -g @code-yeongyu/comment-checker

Tools
  ✅ LSP Server ................. Running
  ✅ MCP: context7 .............. Connected

Updates
  ✅ Version .................... Up to date (v3.1.3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results: 10 passed, 2 warnings, 1 failed
```

---

## Testing

```typescript
describe("Doctor", () => {
  describe("determineExitCode", () => {
    it("returns 0 when all pass", () => {
      const results = [
        { name: "Test 1", status: "pass", message: "" },
        { name: "Test 2", status: "pass", message: "" }
      ]
      expect(determineExitCode(results)).toBe(0)
    })
    
    it("returns 0 when only warnings", () => {
      const results = [
        { name: "Test 1", status: "pass", message: "" },
        { name: "Test 2", status: "warn", message: "" }
      ]
      expect(determineExitCode(results)).toBe(0)
    })
    
    it("returns 1 when critical failure", () => {
      const results = [
        { name: "Configuration Valid", status: "fail", message: "" }
      ]
      expect(determineExitCode(results)).toBe(1)
    })
    
    it("returns 0 when non-critical failure", () => {
      const results = [
        { name: "AST-Grep", status: "fail", message: "" }
      ]
      expect(determineExitCode(results)).toBe(0)
    })
  })
})
```

---

## Adoption Checklist

- [ ] Define check categories for your system
- [ ] Implement critical checks (config, auth)
- [ ] Add non-critical checks (optional deps, updates)
- [ ] Create CLI command with nice output
- [ ] Run doctor on startup or provide manual command
- [ ] Add to CI pipeline for validation

---

## See Also

- [02-evidence-requirements.md](./02-evidence-requirements.md) - Verification requirements
- [../05-eval-methodology.md](../05-eval-methodology.md) - Full evaluation methodology
