import GenericCrudPage from './GenericCrudPage';

export function DriversPage() {
  return (
    <GenericCrudPage 
      title="Водители" 
      endpoint="/drivers" 
      columns={[
        {id: 'id', label: 'ID'}, 
        {id: 'fullName', label: 'ФИО'}, 
        {id: 'licenseNumber', label: 'ВУ'},
        {id: 'licenseCategory', label: 'Категория'}
      ]} 
    />
  );
}
