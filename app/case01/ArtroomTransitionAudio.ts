export function playArtroomTransitionAudio(){
 if(typeof window==="undefined")return;
 const AudioContextClass=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!AudioContextClass)return;
 const context=new AudioContextClass(),master=context.createGain();
 master.gain.setValueAtTime(.0001,context.currentTime);master.gain.exponentialRampToValueAtTime(.17,context.currentTime+.8);master.gain.exponentialRampToValueAtTime(.0001,context.currentTime+9.2);master.connect(context.destination);
 const rainBuffer=context.createBuffer(1,context.sampleRate*10,context.sampleRate),rainData=rainBuffer.getChannelData(0);
 let last=0;for(let i=0;i<rainData.length;i++){last=last*.86+(Math.random()*2-1)*.14;rainData[i]=last}
 const rain=context.createBufferSource(),rainFilter=context.createBiquadFilter(),rainGain=context.createGain();rain.buffer=rainBuffer;rain.loop=true;rainFilter.type="highpass";rainFilter.frequency.value=950;rainGain.gain.value=.32;rain.connect(rainFilter).connect(rainGain).connect(master);rain.start();rain.stop(context.currentTime+9.4);
 const building=context.createOscillator(),buildingGain=context.createGain();building.type="triangle";building.frequency.value=43;buildingGain.gain.value=.055;building.connect(buildingGain).connect(master);building.start();building.stop(context.currentTime+9.4);
 for(const offset of [1.05,1.82,2.74,3.48,4.42]){const step=context.createOscillator(),stepGain=context.createGain();step.type="sine";step.frequency.setValueAtTime(92,context.currentTime+offset);step.frequency.exponentialRampToValueAtTime(42,context.currentTime+offset+.16);stepGain.gain.setValueAtTime(.0001,context.currentTime+offset);stepGain.gain.exponentialRampToValueAtTime(.22,context.currentTime+offset+.02);stepGain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+offset+.23);step.connect(stepGain).connect(master);step.start(context.currentTime+offset);step.stop(context.currentTime+offset+.25)}
 void context.resume();window.setTimeout(()=>void context.close(),9800);
}
