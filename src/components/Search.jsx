import { Card, Banner } from "@shopify/polaris";
import { Loading } from "@shopify/app-bridge-react";
import { gql, useQuery } from "@apollo/client";
import { List } from "./List";
import { useState } from "react";

export function Search({ barcode, skip, setSkip }) {
  console.log(barcode);
  const PRODUCTS_QUERY = gql`
  query {
    products(query:"barcode:${barcode}",first:1){
      edges{
        node{
          title,
          id,
          variants(first:5){
            edges{
              node{
                title,
                id,
                barcode
              }
            }
          }
        }
      }
    }
  }
`;
  const { loading, error, data, refetch } = useQuery(PRODUCTS_QUERY, { skip });
  console.log(skip, loading, error, data);
  if (loading) return <Loading />;

  if (error) {
    console.warn(error);
    return (
      <Banner status="critical">There was an issue loading products.</Banner>
    );
  }

  if (data.products.edges.length === 0) {
    return <Banner status="info">Couldn't find any product.</Banner>;
  }
  let variant;
  if (
    data &&
    data.products.edges.length &&
    data.products.edges[0].node.variants.edges.length
  ) {
    variant = data.products.edges[0].node.variants.edges.map((variant) => {
      if (variant.node.barcode == barcode) {
        return variant;
      }
    })[0].node;
  }
  setSkip(false);
  console.log(variant);
  return (
    <>
      <Card title="Variant" sectioned>
        {variant && <List variant={variant} />}
      </Card>
    </>
  );
}
