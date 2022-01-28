import React from "react";
import {
    Box, Button, Input
} from '@chakra-ui/react';
import './Dialer.css'

export default function Dailer() {
  const [number, setNumber] = React.useState("");
  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <Box id="dialer-container">
      <Input
        autoFocus
        id="dialer-input"
        placeholder="0000-0000"
        type="number"
        value={number}
        onChange={e => setNumber(e.target.value)}
      />

      <Box>
        {buttons.map(char => (
          <Button 
            className="dialer-button" 
            key={char} id={'dp' + char} 
            value={char} 
            onClick={ () => setNumber(number + char) }
          >
            {char}
          </Button>
        ))}
      </Box>
    </Box>
  );
};
