<template>
  <div class="w-full p-4">
    <div v-if="flash" class="absolute left-0 ml-4 py-1 px-2 text-white rounded" :class="flash.success ? 'bg-green-400':'bg-red-500'">{{ flash.message }}</div>
    <div>
      <div class="font-mono mb-2">
        <span class="text-gray-500"><strong>Ghostpass</strong>:</span> <span class="text-gray-700">Really secure passwords.</span>
      </div>
      <router-view @flash="flash = $event" @log="logToConsole"></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      flash: null
    }
  },
  watch: {
    flash: function(flash) {
      if(flash) {
        setTimeout(() => {
          this.flash = null
        }, 5000)
      }
    }
  },
  methods: {
    logToConsole: function($event) {
      if(process.env.NODE_ENV == 'development') {
        console.log($event)
      }
    }
  }
}
</script>