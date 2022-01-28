import React from "react";
import './Popup.css' 
import { 
  VStack,
  CloseButton,
} from '@chakra-ui/react';

function Popup({handleClose, screenMode, isOpen, Content}) {

  return (
    <div className="popup-box" style={{display: isOpen ? "block" : "none"}}>
      <div class="blocker" onClick={handleClose}></div>
      <VStack spacing={3} backgroundColor={screenMode === 'dark' ? 'gray.50' : 'blue.800'} className="box">
        <CloseButton className="close-icon" colorScheme="blackAlpha" onClick={handleClose} />
        <Content/>
      </VStack>
    </div>
  );
}

export default Popup;
