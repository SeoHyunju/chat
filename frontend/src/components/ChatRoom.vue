<template>
  <div>
    <ul class="messageArea">
      <li :class="{eventMessage : active}"></li>
      <span :class="{eventMessageCover : spanActive}">{{lie}}</span>
    </ul>

     <form action="">
       <input type="text" v-model="messageInput" placeholder="메시지 입력...">

       <div class="form-buttons">
         <v-btn @click="sendMessage()">클릭</v-btn>
         
       </div>
     </form>
  </div>
</template>

<script>
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'

export default {
  name:'charRoom',
  props:{
    rooms:{
      type:Array
    }
  },
  data:()=>({
    userName: "",
    message: "",
    currentRoom: null,
    messageInput:'',
    lie:'',
    active : false,
    spanActive:false
  }),
  mounted(){
    this.connectWebSocket();    
    console.log("ddddddddddddddddddddddddddd :"+this.rooms);
  },
  // created:{
  //   disConnect(){
  //     if(this.$store.state.stompClient !== null){
  //       this.$store.state.stompClient.send("/app/chat.removeUser/" + this.currentRoom.id,
  //         {},
  //         JSON.stringify({sender:this.userName, type:'LEAVE'})
  //       )
  //       this.$store.state.stompClient.this.disConnect();
  //       this.currentRoom = null;
  //     }
  //   }
  // },
  methods:{
    sendMessage() {
      var messageContent = this.messageInput.trim()
      if (messageContent && this.$store.state.stompClient) {
        let msg = { 
          type:'CHAT',
          content: this.messageInput,
          sender:this.userName
        };
        this.$store.state.stompClient.send("/app/chat.sendMessage/" + this.currentRoom[0].id,  JSON.stringify(msg));
        this.messageInput = '';
      }
    },  

    connectWebSocket(){
      this.userName = Math.random().toString(36).substr(2, 5);
      
      if(this.userName){
         //this.disConnect();
        this.currentRoom = this.rooms;
        this.$store.state.socket = new SockJS('http://192.168.1.49:8090/ws')
        this.$store.state.stompClient = Stomp.over(this.$store.state.socket)
        this.$store.state.stompClient.connect(
            {},
            () => {
              console.log('소켓연결 성공');
              // this.$store.state.stompClient.subscribe('/topic/' + this.currentRoom[0].id, this.onMessageReceived)
              
              this.$store.state.stompClient.subscribe('/topic/'+this.currentRoom[0].id, res=>{
                console.log("resresresresrdddddd***es"+ JSON.parse(res.body));

                let message =  JSON.parse(res.body);

                if(message.type === "JOIN"){
                  this.active = true;
                  this.spanActive = true;
                  this.lie = message.content + '방에' + message.sender + '님이 입장하였습니다.'
                }
                
              })
              
              this.$store.state.stompClient.send('/app/char.addUser' + this.currentRoom[0].id,
                JSON.stringify({
                  content:this.currentRoom[0].title,
                  sender:this.userName,
                  type:'JOIN'
                })
              )
            },
            error => {
              console.log('소켓연결 실패' + JSON.stringify(error));
            }
          )
      }
    },

    // onMessageReceived(payload){
    //   let message = JSON.parse(payload.body)
      
    //   if(message.type === 'JOIN'){
    //     this.active = true //li
    //     this.spanActive = true //span
    //     message.content = message.content + '방에' + message.sender + '님이 입장하셨습니다.'
    //   }

    // }
  }
}
</script>

<style lang="scss">
 @import '@/scss/dev.scss'
</style>
