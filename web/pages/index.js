export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/products',
      permanent: false,
    },
  };
}

export default function HomePage() {
  return null;
}

