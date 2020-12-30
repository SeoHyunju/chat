<template>
  <v-app>
    <div class="mobile-content">
      <div class="aside-content">
        <v-list class="menu-list">
          <p> Chat</p>
          <v-list-item-group
          color="#a639c1"
          >
            <v-list-item
            link
            v-for="(model, index) in rooms"
            :key="index"
            :to="model.title"
            @click="listIndex(index)"
            >
              <v-list-item-icon class="menu-img">
                <img :src = model.img>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{model.title}}</v-list-item-title>
                <v-list-item-subtitle class="menu-subtitle">{{model.description}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>

      <v-main class="chat-main" :class="{on:chatContentActive}">
        <main-room v-if="mIndex == null" class="main-null-contnet" />
        
        <div v-else class="chat-content" >
          <div class="chat-header">
            <v-btn @click="exit"><v-icon>mdi-arrow-left-bold</v-icon> </v-btn>
            <span class="img-icon"><img :src = rooms[mIndex].img></span>
            {{currentRoom[mIndex].title}}
          </div>
          
          <ul ref="messageArea" class="message-area">
            
          </ul>

          <form class="chat-form">
            <input type="text" v-model="messageInput" @keydown.enter="sendMessage" placeholder="메시지 입력">

            <div class="form-buttons">
              <v-btn @click="sendMessage" >전송</v-btn>
            </div>
          </form>
        </div>
      </v-main>
    </div>
  </v-app>
</template>

<script>
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'

export default {
  name: 'App',
  data: () => ({
    chatContentActive:false,
    userName: "",
    message: "",
    currentRoom: null,
    messageInput:'',
    lie:'',
    rooms:[{
      id:'1',
      type:0,
      title:'채팅1',
      description:'여기로',
      category:['#태그1'],
      img:'/img/santa-claus.23b372ab.png',
      max:10,
      member:0
    },
    {
      id:'2',
      type:1,
      title:'채팅2',
      description:'여기로2',
      category:['#태그2'],
      img:'/img/santa-claus.23b372ab.png',
      max:10,
      member:null
    }],
    mIndex:null
  }),
  methods:{
    disConnect(){
      if(this.$store.state.stompClient !== null){
        this.$store.state.stompClient.send('/app/chat.removeUser/' + this.currentRoom[this.mIndex].id,
          JSON.stringify({sender:this.userName, type:'LEAVE'})
        )
        this.$store.state.stompClient.disConnect();
        this.currentRoom = null
      }
    },

    sendMessage(e) {
      console.log("전송 버튼");
      var messageContent = this.messageInput.trim()
      if (messageContent && this.$store.state.stompClient) {
        var message = { 
          type:'CHAT',
          content: this.messageInput,
          sender:this.userName
        };
        this.$store.state.stompClient.send("/app/chat.sendMessage/" + this.currentRoom[this.mIndex].id,  JSON.stringify(message));
        this.messageInput = '';
      }

      e.preventDefault();
      
    },  

    connectWebSocket(index){
      
      this.userName = Math.random().toString(36).substr(2, 5);
      
      if(this.userName){
      
        this.disConnect();
        this.currentRoom = this.rooms;
        this.$store.state.socket = new SockJS('http://192.168.1.49:8090/ws')
        this.$store.state.stompClient = Stomp.over(this.$store.state.socket)
        this.$store.state.stompClient.connect(
          {},
          () => {
            console.log('소켓연결 성공');
            
            this.$store.state.stompClient.subscribe('/topic/'+this.currentRoom[index].id, res=>{

              let resJson = JSON.parse(res.body)

              let messageElement = document.createElement('li')
              let messageCoverElement = document.createElement('span')

              if(resJson.type === "JOIN"){
                messageCoverElement.classList.add('event-message-cover')
                messageElement.classList.add('event-message')
                resJson.content = "'"+resJson.sender+"'" + '님이 입장하였습니다. 🐱 '
              }else if(resJson.type === "LEAVE"){
                messageCoverElement.classList.add('event-message-cover')
                messageElement.classList.add('event-message')
                resJson.content = resJson.sender + '님이 나갔습니다. 💨'
              }else{
                messageCoverElement.classList.add('chat-message-cover')
                messageElement.classList.add('chat-message')

                if(resJson.sender === this.userName){
                messageCoverElement.classList.add('me')
                messageElement.classList.add('me')
                }
/*
                let avatarElement = document.createElement('i');
                let avatarText = document.createTextNode(resJson.sender[0])
                avatarElement.appendChild(avatarText)

                messageCoverElement.appendChild(avatarElement)
*/
                let usernameElement = document.createElement('span')
                let usernameText = document.createTextNode(resJson.sender);
                usernameElement.appendChild(usernameText)
                messageCoverElement.appendChild(usernameElement)
              }

              let textElement = document.createElement('p');
              textElement.classList.add('user-text')
              let messageText = document.createTextNode(resJson.content);
              textElement.appendChild(messageText)

              messageCoverElement.appendChild(textElement)
              messageElement.appendChild(messageCoverElement)

              this.$refs.messageArea.appendChild(messageElement)
              
            })

            this.$store.state.stompClient.send('/app/chat.addUser/'+this.currentRoom[index].id,
              JSON.stringify({
                content:this.currentRoom[index].title,
                sender:this.userName,
                type:'JOIN'
              })
            )
          },
          error => {
            console.log('소켓연결 실패' + JSON.stringify(error));
          }
        )

        // 대화 초기화 설정하기
        this.$refs.messageArea = null;
      }
    },
    listIndex(index){
      this.mIndex = index
      this.connectWebSocket(index); 
      this.chatContentActive = true
    },
    exit(){
      this.$router.push('/');
      location.reload();
    }
  }  
  
};
</script>

<style lang="scss">
 @import '@/scss/dev.scss'
</style>