import { useParams } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: '32px' }}>
      <h1>Product Detail</h1>
      <p>Full view for product ID: {id} — quantity history and update controls.</p>
    </div>
  );
}
