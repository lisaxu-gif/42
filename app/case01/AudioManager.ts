const AUDIO_PATHS={bgm:"/audio/bgm/case01.mp3",click:"/audio/effect/click.mp3",accessOpen:"/audio/effect/access-open.mp3",gateOpen:"/audio/effect/gate-open.mp3",artroomDoor:"/audio/effect/artroom-door.mp3",sinkBag:"/audio/effect/sink-bag.mp3",monologue:"/audio/story/morikawa.mp3"} as const;

class AudioManager{
 private channels=new Map<string,HTMLAudioElement>();
 private volume=.28;

 private play(channel:string,src:string,loop=false,volume=1){
  if(typeof window==="undefined")return;
  const existing=this.channels.get(channel);
  if(existing&&existing.dataset.path===src){existing.volume=this.volume*volume;void existing.play().catch(()=>{});return}
  this.stop(channel);
  const audio=new Audio(src);
  audio.dataset.path=src;audio.loop=loop;audio.volume=this.volume*volume;audio.preload="auto";
  this.channels.set(channel,audio);
  void audio.play().catch(()=>{});
 }

 playBGM(){this.play("bgm",AUDIO_PATHS.bgm,true)}
 stopBGM(){this.stop("bgm")}
 setVolume(volume:number){this.volume=Math.max(0,Math.min(1,volume));for(const audio of this.channels.values())audio.volume=this.volume}
 playEffect(effect:keyof Pick<typeof AUDIO_PATHS,"click"|"accessOpen"|"gateOpen"|"artroomDoor"|"sinkBag">="click"){this.play("effect",AUDIO_PATHS[effect],false,1.65)}
 playMonologue(){this.play("monologue",AUDIO_PATHS.monologue,true,1.15)}
 lowerBackground(){const bgm=this.channels.get("bgm");if(bgm)bgm.volume=this.volume*.22}
 stopAudio(){for(const channel of [...this.channels.keys()])this.stop(channel)}

 private stop(channel:string){
  const audio=this.channels.get(channel);
  if(!audio)return;
  audio.pause();audio.currentTime=0;audio.src="";this.channels.delete(channel);
 }
}

export const audioManager=new AudioManager();
