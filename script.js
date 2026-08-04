document.addEventListener(
"DOMContentLoaded",
()=>{


const counters =
document.querySelectorAll(".counter");


counters.forEach(counter=>{


let target =
parseInt(counter.innerText);


let current = 0;


let speed =
target / 40;


let timer =
setInterval(()=>{


current += speed;


if(current>=target){

counter.innerText =
target;

clearInterval(timer);

}

else{

counter.innerText =
Math.floor(current);

}


},30);



});



});
