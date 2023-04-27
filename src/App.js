import ScreenRecorder from "./ScreenAndVideoRecord";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  spacing: 8, // set your desired spacing value
  // your other theme options here
});


const App = () => {
  

  return (
    <ThemeProvider theme={theme}>
      <ScreenRecorder/>
      </ThemeProvider>
  );
};

export default App;
