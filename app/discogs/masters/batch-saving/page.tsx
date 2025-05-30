/**

PLAN:

Essa pagina (#sym:BatchSavingMasterPage) vai receber o redirecionamento de app\discogs\search\[query]\SearchClient.tsx:

  const handleSaveSelected = useCallback(() => {
    const query = Array.from(selectedItems).join(',')
    router.push(`/discogs/masters/batch-saving?ids=${query}`)
  }, [selectedItems])


Funcionamento da página:

- [ ] Faça que a página possa ser chamada via fetch de forma simples. se necessário crie uma API e altere a página original para que chame a API,  então dessa forma migre o código de servidor para esses novos endpoints.
- [ ] Crie um lista com todos os masters ids
- [ ] Quando o usuário clicar no botão, faça a chamada via fetch do "app\discogs\masters\[master_id]\save\page.tsx"
- [ ] após o master ser carregado, vá para o próximo e repita até acabar
- [ ] faça um por vez, serial


*/

export default async function BatchSavingMasterPage({}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Batch Saving Masters</h1>
      <p>This page is under construction. Please check back later.</p>
    </div>
  )
}
