export default async function handler(req, res) {
  // Busca a lista de arquivos da pasta content/blog/ no GitHub (repo público)
  const repo = 'nathancwb/cni-plasticos';
  const branch = 'main';

  try {
    const listRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/content/blog?ref=${branch}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'cni-plasticos-site',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
        }
      }
    );

    if (!listRes.ok) {
      res.status(500).json({ error: 'Não foi possível listar os posts' });
      return;
    }

    const files = await listRes.json();
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    // Busca o conteúdo de cada post
    const posts = await Promise.all(
      jsonFiles.map(async file => {
        const contentRes = await fetch(file.download_url);
        const post = await contentRes.json();
        return post;
      })
    );

    // Ordena por data (mais recente primeiro)
    posts.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return isNaN(db) ? -1 : isNaN(da) ? 1 : db - da;
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao carregar posts' });
  }
}
