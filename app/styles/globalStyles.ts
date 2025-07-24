import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  background: {
    backgroundColor: '#F5DEB3',
  },
  font: {
    color: '#4682B4',
  },
  signInButton: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    backgroundColor: 'gradient(45deg, #4682B4, #5F9EA0)',
    borderWidth: 1,
    borderColor: '#4682B4',
    borderRadius: 5,
  },
  signUpButton: {
    opacity: 0.8,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    backgroundColor: '#4682B4',
    borderWidth: 1,
    borderColor: '#4682B4',
    borderRadius: 5,
  },
})

// So, the updated comprehensive palette based on the last image would include:

// Deep Ocean Blues (Darkest Water/Waves): #2C4A57, #3D6B82

// Mid-Tone Water Blues (Waves/Horizon): #5F9EA0, #7FB3C2

// Sandy Beige/Orange (Beach/Land): #F5DEB3, #E0A86A, #FBC474

// Sunrise/Sunset Orange/Gold (Sun/Sky): #FFA500, #FFD700

// Warm Peach/Light Terracotta (Sky/Cloud Edges): #FFC0A0

// Cloud/Sky Off-Whites/Grays: #F8F8F8, #E0E0E0, #D0D7DA

// These are still approximations, but #FFC0A0 should give you a good starting point for that reddish nuance.
