import { useParams } from 'react-router-dom';

export default function AddEditProduct() {
  const { id } = useParams();
  const mode = id ? 'Edit' : 'Add';

  return (
    <div style={{ padding: '32px' }}>
      <h1>{mode} Product</h1>
      <p>{mode === 'Edit' ? `Editing product ID: ${id}` : 'Form to add a new product.'}</p>
    </div>
  );
}
