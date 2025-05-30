import { defineStore } from 'pinia'

export const useAnimationStore = defineStore('animations', {
  state: () => ({
    isInputActive: false,
    isProcessing: false,
    cardExpanded: null,
    currentView: 'home', // 'home' | 'results'
    emotions: [],
    recommendedTracks: [],
    emotionAnalysis: '',
    processingStage: 0, // 0-100
    processingText: ''
  }),
  
  getters: {
    isHomeView: (state) => state.currentView === 'home',
    isResultsView: (state) => state.currentView === 'results',
    hasRecommendations: (state) => state.recommendedTracks.length > 0
  },
  
  actions: {
    setInputActive(active) {
      this.isInputActive = active
    },
    
    setProcessing(processing) {
      this.isProcessing = processing
    },
    
    setCardExpanded(cardId) {
      this.cardExpanded = cardId
    },
    
    setCurrentView(view) {
      this.currentView = view
    },
    
    setEmotionAnalysis(analysis) {
      this.emotionAnalysis = analysis
    },
    
    setRecommendedTracks(tracks) {
      this.recommendedTracks = tracks
    },
    
    updateProcessing(stage, text) {
      this.processingStage = stage
      this.processingText = text
    },
    
    resetState() {
      this.isInputActive = false
      this.isProcessing = false
      this.cardExpanded = null
      this.currentView = 'home'
      this.emotions = []
      this.recommendedTracks = []
      this.emotionAnalysis = ''
      this.processingStage = 0
      this.processingText = ''
    }
  }
})
