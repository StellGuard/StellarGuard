import { evaluatePolicy } from "../src/policy.js";
import type { GuardPolicy, GuardTransaction } from "../src/types.js";
import "./style.css";

const transactionExample: GuardTransaction = {
  network: "Test SDF Network ; September 2015",
  operations: [{ type: "payment", destination: "G...TRUSTED_DESTINATION", asset: "native", amount: "12.5" }]
};
const policyExample: GuardPolicy = {
  allowedNetworks: ["Test SDF Network ; September 2015"],
  allowedOperationTypes: ["payment"],
  allowedDestinations: ["G...TRUSTED_DESTINATION"],
  allowedAssets: ["native"],
  maxPaymentAmount: "250"
};
const txInput = document.querySelector<HTMLTextAreaElement>("#transaction")!;
const policyInput = document.querySelector<HTMLTextAreaElement>("#policy")!;
const result = document.querySelector<HTMLElement>("#result")!;
const setExamples = () => {
  txInput.value = JSON.stringify(transactionExample, null, 2);
  policyInput.value = JSON.stringify(policyExample, null, 2);
  result.innerHTML = '<div class="empty-state"><div class="empty-icon">◎</div><h2>Awaiting evaluation</h2><p>Run the policy check to see the decision and findings.</p></div>';
};
setExamples();
document.querySelector("#reset")!.addEventListener("click", setExamples);
document.querySelector("#evaluate")!.addEventListener("click", () => {
  try {
    const transaction = JSON.parse(txInput.value) as GuardTransaction;
    const policy = JSON.parse(policyInput.value) as GuardPolicy;
    if (!transaction || typeof transaction.network !== "string" || !Array.isArray(transaction.operations)) {
      throw new Error("Transaction must include a network string and an operations array.");
    }
    if (!policy || !Array.isArray(policy.allowedOperationTypes)) {
      throw new Error("Policy must include an allowedOperationTypes array.");
    }
    const decision = evaluatePolicy(transaction, policy);
    const title = decision.allowed ? "Policy passed" : "Transaction blocked";
    const code = decision.allowed ? "PASS" : "BLOCKED";
    const details = decision.findings.length
      ? decision.findings.map((finding) => `<li class="finding ${finding.severity}"><div><strong>${escapeHtml(finding.code)}</strong><span>${escapeHtml(finding.message)}</span></div><em>${finding.severity}</em></li>`).join("")
      : '<li class="finding clear"><div><strong>NO_FINDINGS</strong><span>No policy violations were detected in the supplied transaction data.</span></div><em>clear</em></li>';
    result.innerHTML = `<div class="result-head"><div><span class="result-label">POLICY DECISION</span><h2>${title}</h2></div><span class="status ${decision.allowed ? "pass" : "blocked"}">${code}</span></div><p class="result-summary">${decision.findings.length} finding(s) returned by the evaluator.</p><ul class="findings">${details}</ul>`;
  } catch (error) {
    result.innerHTML = `<div class="result-head"><div><span class="result-label">INPUT ERROR</span><h2>Could not evaluate</h2></div><span class="status blocked">ERROR</span></div><p class="error-message">${escapeHtml(error instanceof Error ? error.message : "Invalid input.")}</p>`;
  }
});
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
