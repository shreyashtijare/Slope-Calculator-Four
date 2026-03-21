import { initUIControls } from './ui-controls.js';
import { initSlopeCalculator } from './slope-calculator.js';
import { initSlopeConverter } from './slope-converter.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing application...');
  
  initUIControls();
  initSlopeCalculator();
  initSlopeConverter();
  
  console.log('Application initialized!');
});
window.addEventListener("DOMContentLoaded", () => {
setTimeout(()=>{
const he = document.getElementById("he")
if (he) he.focus()
},200)
})
