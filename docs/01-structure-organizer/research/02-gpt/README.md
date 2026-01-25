---
title: "GPT-4 Research: AI Agent Architecture Guide"
description: "Comprehensive design guide for Command, Skill, and Agent architecture with decision trees, templates, and anti-patterns."
type: index
tags: [Architecture, AI]
order: 2
---

# GPT-4 Research: AI Agent Architecture Guide

> Comprehensive design guide for Command, Skill, and Agent architecture

## Contents

| # | Section | EN | KO |
|---|---------|----|----|
| 01 | Concept Definitions & Boundaries | [01-concepts.en.md](./01-concepts.en.md) | [01-concepts.ko.md](./01-concepts.ko.md) |
| 02 | Relationship Model | [02-relationships.en.md](./02-relationships.en.md) | [02-relationships.ko.md](./02-relationships.ko.md) |
| 03 | Decision Rules | [03-decision-rules.en.md](./03-decision-rules.en.md) | [03-decision-rules.ko.md](./03-decision-rules.ko.md) |
| 04 | Design Templates | [04-templates.en.md](./04-templates.en.md) | [04-templates.ko.md](./04-templates.ko.md) |
| 05 | Example Designs | [05-examples.en.md](./05-examples.en.md) | [05-examples.ko.md](./05-examples.ko.md) |
| 06 | Anti-patterns & Guardrails | [06-anti-patterns.en.md](./06-anti-patterns.en.md) | [06-anti-patterns.ko.md](./06-anti-patterns.ko.md) |

## Section Overview

### 01. Concept Definitions & Boundaries
- Command, Skill, Agent precise definitions
- Terminology mapping across frameworks
- 10 boundary case Q&As

### 02. Relationship Model
- Hierarchy (Agent → Workflow → Command/Skill → Tool)
- Contracts (I/O and exception policies)
- Operations (Versioning, Testing, Observability, Rollback)

### 03. Decision Rules
- Decision tree flowchart
- Design selection checklist

### 04. Design Templates
- Command Spec Template
- Skill Spec Template
- Agent Spec Template

### 05. Example Designs
- Example 1: New App Scaffolding + CI Setup
- Example 2: Bug Report → PR Creation

### 06. Anti-patterns & Guardrails
- 12 common anti-patterns with prevention measures
- Environment verification checklist
- 1-week implementation plan
