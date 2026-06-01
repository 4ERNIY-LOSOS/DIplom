import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, Divider, AppBar, Toolbar, CssBaseline } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from './AuthContext';

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role.name;

  const menuItems = {
    admin: [
      { text: 'Управление', path: '/admin' },
    ],
    logistician: [
      { text: 'Заявки', path: '/logistician/orders' },
      { text: 'Перевозки', path: '/logistician/shipments' },
    ],
    client: [
      { text: 'Заявки', path: '/client' },
      { text: 'Профиль', path: '/profile' },
    ]
  };

  const menu = menuItems[role as keyof typeof menuItems] || [];
  const currentItem = menu.find(item => item.path === location.pathname);
  const title = currentItem ? currentItem.text : 'Рабочая область';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: `calc(100% - 260px)`, ml: '260px', bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>{title}</Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer variant="permanent" sx={{ width: 260, flexShrink: 0, '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box', bgcolor: '#ffffff', color: '#333' } }}>
        <Typography variant="h6" sx={{ p: 2.5, fontWeight: 'bold', borderBottom: '1px solid #eee' }}>LOGISTICS</Typography>
        <List>
          {menu.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path} 
                onClick={() => navigate(item.path)}
                sx={{ '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#1976d2' } }}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItemButton onClick={() => navigate(`/${role}`)}>
            <ArrowBackIcon sx={{ mr: 2, color: '#555' }} />
            <ListItemText primary="Назад" />
          </ListItemButton>
          <ListItemButton onClick={logout}>
            <ExitToAppIcon sx={{ mr: 2, color: '#d32f2f' }} />
            <ListItemText primary="Выйти" sx={{ color: '#d32f2f' }} />
          </ListItemButton>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
