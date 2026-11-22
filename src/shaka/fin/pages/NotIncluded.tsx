/* Shown on a direct visit to a retired page from the earlier, larger scope. */
import { fin } from "../store";
import { NOT_INCLUDED, PAGE_LABEL } from "../nav";
import { Page, Card, Btn, Row } from "../../ui";

export default function NotIncluded({ from }: { from: string }) {
  const x = NOT_INCLUDED[from] ?? { label: from, why: "This area is not part of phase one.", nearest: "Home" };
  return (
    <Page period="Not included in the initial rollout" title={x.label}>
      <Card style={{ maxWidth: "640px" }}>
        <div style={{ fontSize: "13.5px", color: "var(--body)", lineHeight: 1.6 }}>{x.why}</div>
        <Row style={{ marginTop: "16px" }}>
          <Btn kind="primary" onClick={() => fin.go(x.nearest)}>Go to {PAGE_LABEL[x.nearest] ?? x.nearest}</Btn>
          <Btn onClick={() => fin.go("Home")}>Back to Home</Btn>
        </Row>
      </Card>
    </Page>
  );
}
