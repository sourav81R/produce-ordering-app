export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/order/new',
      permanent: false,
    },
  };
}

export default function CartPage() {
  return null;
}
