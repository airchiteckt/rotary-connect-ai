export default function SimpleTestClub() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>TEST CLUB PAGE WORKS!</h1>
      <p>URL: {window.location.href}</p>
      <p>Pathname: {window.location.pathname}</p>
    </div>
  );
}