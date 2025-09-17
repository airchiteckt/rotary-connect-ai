import { useParams } from 'react-router-dom';

export default function TestClub() {
  const { clubSlug } = useParams();
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Club Test Page</h1>
      <p>Club Slug: {clubSlug}</p>
      <p>Se vedi questo messaggio, il routing funziona!</p>
    </div>
  );
}