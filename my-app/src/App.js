import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const speechSynthesis = window.speechSynthesis;
const speechUtterance = new SpeechSynthesisUtterance();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const Recognition = new SpeechRecognition();
const GrammarList = new SpeechGrammarList();

class App extends Component {
    constructor (props) {
        super(props)

        if ('speechSynthesis' in window) {
            console.log(window.speechSynthesis);
        } else {
            console.warn('The current browser does not support the speechSynthesis API.')
        }

        if (Recognition) {
            Recognition.onresult = this.updateTranscript;
            // Recognition.onspeechstart = this.updateTranscript;
            Recognition.onspeechend = this.stopVoiceListener;
            this.setUpRecognition();
            /*
            Recognition.onsoundstart = this.updateTranscript;
            Recognition.onsoundend = this.updateTranscript;
            */
        }

    }

    state = {
        voices:[],
        text:'',
        listening:false
    }

    componentWillMount() {
        speechSynthesis.onvoiceschanged = () => {
            this.setState({
                voices: speechSynthesis.getVoices()
            })
            this.selectLanguage();
        }
    }

    selectLanguage = (idx = 0) => {
        speechUtterance.voiceURI = this.state.voices[idx].name;
        speechUtterance.lang = this.state.voices[idx].lang;
    }

    languageSelectHandler = (event) => {
        const currentIndex = event.target.value;
        this.selectLanguage(currentIndex);
    }

     // 0 to 1
    setVolume = (volume = 0) => speechUtterance.volume = volume;

    // 0.1 to 10
    setRate = (rate = 1) => speechUtterance.rate = rate;

    // 0 to 2
    setPitch = (pitch = 1.5) => speechUtterance.pitch = pitch;

    voiceSelection = () => {
        return (
            <select onChange={this.languageSelectHandler} >
                {this.state.voices.map((value, idx) => {
                    return(
                        <option
                            key={idx}
                            value={idx} >
                                {value.voiceURI} - {value.lang}
                        </option>
                    )
                })}
            </select>
        )
    }

    speak = () => {
        if (speechSynthesis.speaking) {
            //speechUtterance.cancel()
            return;
        }
        speechUtterance.text = this.state.text;
        speechSynthesis.speak(speechUtterance);
    }

    speakButtonHandler = (event) => {
        this.speak();
    }

    handleTextAreaChange = (event) => {
        const currentText = event.target.value;
        this.setText(currentText);
    }

    setText = (text='') => {
        this.setState({
            text
        })
    }

    //Speech to text

    setUpRecognition = () => {
        //GrammarList.addFromString(grammar, 1);
        //Recognition.grammars = speechRecognitionList;
        //Recognition.continuous = false;
        Recognition.lang = 'en-US';
        Recognition.interimResults = false;
        Recognition.maxAlternatives = 1;

    }

    startVoiceListener = () => {
        console.log('start listening');
        if (Recognition && !this.state.listening) {
            try {
                Recognition.start()
            } catch (DOMException) {
                // Tried to start recognition after it has already started - safe to swallow this error
            }
            this.setState({
                listening: true
            })
        }
    }

    stopVoiceListener = () => {
        console.log('stop listening');
        this.setState({
            listening: false
        })
        Recognition.stop();
    }

    abortVoiceListener = () => {
        this.setState({
            listening: false
        })
        Recognition.abort();
    }

    updateTranscript = (event) => {
        console.log(event.results[0][0].transcript);
        const currentText = event.results[0][0].transcript;
        this.setState({
            text: currentText
        })
    }

    render() {
        const { voices } = this.state;

        if (voices.length < 1) {
            return(
                <div>loading</div>
            )
        }

        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Speech Synthesis and Recognition Test</h1>
                </header>
                { this.voiceSelection() }
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <textarea value={this.state.text} onChange={this.handleTextAreaChange} placeholder="Type your text here">
                </textarea>
                <button onClick={this.speakButtonHandler}>Read Text!</button>
                <button onClick={this.startVoiceListener}>Start Talking!</button>
                <button onClick={this.stopVoiceListener}>Stop Talking!</button>
            </div>
        );
    }
}

export default App;
