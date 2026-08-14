export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Gestion de Commerce SaaS</h1>
      <p className="mt-4 text-xl">Bienvenue sur votre plateforme</p>
      <div className="mt-8 flex gap-4">
        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Se connecter</a>
        <a href="/register" className="px-4 py-2 border border-gray-300 rounded">Créer un compte</a>
      </div>
    </main>
  );
}