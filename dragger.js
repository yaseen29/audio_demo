//Make the DIV element draggagle:
// dragElement(document.getElementById("mydiv"));
dragElement(document.getElementById("sound1"));
dragElement(document.getElementById("sound2"));

window.isDragging = false

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown; 
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    window.isDragging = true;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    // changeVolume(elmnt)
  }

  function changeVolume(el) {
    let trackEl1 = document.getElementById("sound1")
    let trackEl2 = document.getElementById("sound2")

    let dist1 = distanceBetweenElements(el, trackEl1)
    let dist2 = distanceBetweenElements(el, trackEl2)

    console.log("distances", dist1, dist2)
  }

  function distanceBetweenElements(elementOne, elementTwo) {
    let distance = -1;
    
    const x1 = elementOne.offsetTop;
    const y1 = elementOne.offsetLeft;
    const x2 = elementTwo.offsetTop;
    const y2 = elementTwo.offsetLeft;
    const xDistance = x1 - x2;
    const yDistance = y1 - y2;
    
    distance = Math.sqrt(
      (xDistance * xDistance) + (yDistance * yDistance)
    );
    return distance
  }
  
  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    window.isDragging = false
  }
  
}