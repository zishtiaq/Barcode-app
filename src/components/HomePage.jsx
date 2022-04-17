import { gql, useApolloClient } from "@apollo/client";
import {
  Card,
  Page,
  Layout,
  Banner,
  Form,
  FormLayout,
  TextField,
  Button,
} from "@shopify/polaris";

import { useState, useCallback } from "react";
import { List } from "./List";

export function HomePage() {
  let results = null;
  const [barcode, setBarcode] = useState("");
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    message: false,
    status: "critical",
  });

  const client = useApolloClient();

  const handleSubmit = async (_event) => {
    const PRODUCTS_QUERY = gql`
    query {
      products(query:"barcode:${barcode}",first:1){
        edges{
          node{
            title,
            id,
            variants(first:50){
              edges{
                node{
                  price,
                  barcode,
                  displayName
                }
              }
            }
          }
        }
      }
    }
`;
    _event.preventDefault();
    setLoading(true);
    console.log(PRODUCTS_QUERY);
    let { data } = await client.query({
      query: PRODUCTS_QUERY,
    });
    if (!data || data.products.edges.length === 0) {
      setLoading(false);
      setVariant(null);
      setError({
        message: "Not Found",
        status: "critical",
      });

      return;
    }
    console.log(data.products.edges[0]);
    console.log(data.products.edges[0].node.variants.edges);
    let v = data.products.edges[0].node.variants.edges.map((vari) => {
      if (vari.node.barcode == barcode) {
        return vari;
      }
    })[0];
    if (!v.node) console.log(v);
    if (v && v.node) {
      setVariant(v.node);
      setError({
        message: false,
        status: "critical",
      });
    } else {
      setError({
        message: "Not Found",
        status: "critical",
      });
      setVariant(null);
    }
    setLoading(false);
  };
  const handleBarcodeChange = (value) => setBarcode(value);
  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          {error.message && (
            <Banner status={error.status}>{error.message}</Banner>
          )}
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={barcode}
                  onChange={handleBarcodeChange}
                  label="Barcode"
                  type="number"
                  helpText={
                    <span>We’ll use this barcode to search variant</span>
                  }
                />
                <Button submit loading={loading}>
                  Submit
                </Button>
              </FormLayout>
            </Form>
          </Card>
          {variant && <List variant={variant} />}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
