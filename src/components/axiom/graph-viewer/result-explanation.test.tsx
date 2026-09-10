import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { recordedEvidence, ResultExplanation, type ExplanationRun } from "./result-explanation";
import type { ProgramGraph, RuleNode } from "./types";
const rule = (legalId: string): RuleNode => ({ legalId, name: legalId.split("#").at(-1)!, fileLegalId: "law", kind: "derived", entity: null, dtype: null, period: null, unit: null, source: null, ruleDeps: [], inputDeps: [], relationDeps: [] });
const graph: ProgramGraph = { rules: [{...rule("law#result"), ruleDeps:["law#condition","law#missing"], formula:"if condition: 5 else: 0"},rule("law#condition")], inputs:[],relations:[],ownOutputs:[],terminalOutputs:[] };
const run: ExplanationRun = { outputs:{result:0},trace:[{variable:"condition",value:false}] };
describe("execution evidence", () => {
 it("preserves false and zero", () => {
  expect(recordedEvidence(graph,run,"law#result")?.value).toBe(0);
  expect(recordedEvidence(graph,run,"law#condition")?.value).toBe(false);
 });
 it("does not guess between duplicate fragments", () => {
  expect(recordedEvidence({...graph,rules:[...graph.rules,rule("other#condition")]},run,"law#condition")).toBeUndefined();
 });
 it("keeps entity identities attached to values", () => {
  expect(recordedEvidence(graph,{...run,trace:[{variable:"condition",value:null,instances:[{entity_id:"person1",value:false},{entity_id:"person2",value:true}]}]},"law#condition")?.value).toEqual({person1:false,person2:true});
 });
 it("shows missing evidence and stale state without inventing branch decisions", () => {
  render(<ResultExplanation graph={graph} run={run} rootId="law#result" stale onRead={vi.fn()} />);
  expect(screen.getByText("False")).toBeInTheDocument();
  expect(screen.getByText(/previous run/)).toBeInTheDocument();
  expect(screen.getAllByText("Not reported").length).toBeGreaterThan(0);
  expect(screen.getByText(/does not report branch decisions/)).toBeInTheDocument();
 });
});
