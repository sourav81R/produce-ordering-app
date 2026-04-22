export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/cart',
      permanent: false,
    },
  };
}

export default function PlaceOrderPage() {
  return null;
}
