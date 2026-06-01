import GenericCrudPage from './GenericCrudPage';

export function VehiclesPage() {
  return (
    <GenericCrudPage 
      title="Транспорт" 
      endpoint="/vehicles" 
      columns={[
        {id: 'id', label: 'ID'}, 
        {id: 'model', label: 'Модель'}, 
        {id: 'plateNumber', label: 'Номер'}
      ]} 
    />
  );
}
