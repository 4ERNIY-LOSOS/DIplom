import GenericCrudPage from './GenericCrudPage';

export function WarehousesPage() {
  return (
    <GenericCrudPage 
      title="Склады" 
      endpoint="/warehouses" 
      columns={[
        {id: 'id', label: 'ID'}, 
        {id: 'name', label: 'Название'}, 
        {id: 'address', label: 'Адрес'}
      ]} 
    />
  );
}
