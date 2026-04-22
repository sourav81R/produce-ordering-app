import Head from 'next/head';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import ProductTable from '../components/ProductTable';
import { buildServerApiClient, getServerApiBaseUrl } from '../lib/api';

export default function ProductsPage({ products, errorMessage }) {
  return (
    <Layout>
      <Head>
        <title>Products | Produce Ordering App</title>
      </Head>

      <div className="page-stack">
        <PageHeader
          title="Products"
          description="Browse available vegetables and fruits, then place bulk orders for your next delivery."
        />

        {errorMessage ? <p className="alert error">{errorMessage}</p> : null}
        <ProductTable products={products} />
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const client = buildServerApiClient(getServerApiBaseUrl());
    const response = await client.get('/products');

    return {
      props: {
        products: response.data,
        errorMessage: '',
      },
    };
  } catch (_error) {
    return {
      props: {
        products: [],
        errorMessage: 'Unable to load products right now.',
      },
    };
  }
}
