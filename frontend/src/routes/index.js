import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode:'history',
  routes:[
   {
    path:'/:model',
    component:() => import('../components/ChatRoom'),
    name:'chatRoom',
   },{
     path : '/',
     component:() => import('../App'),
     name:"main"
   }
  ]
})

export default router