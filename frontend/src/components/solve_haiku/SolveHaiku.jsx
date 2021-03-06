import React, { useState, useEffect, memo} from 'react';
import { formatHaiku } from 'util/haiku_format_util';
import { HSContainer, 
         Message, 
         MsgHighlight,
         MsgSub, 
         Button,
         Countdown,
         HaikuContainer,
         Haiku,
         LIContainer,
         LIElement,
         HaikuLine,
         AuthorIcon,
         AuthorIconSm,
         HaikuLineIndex,
        } from "./SolveHaiku.styled";

import authorAvatars from 'assets/index';

const SolveHaiku = ({getHaiku, updateHaiku, haikuId, haiku, authors, users, currUserId, openTS }) => {

  const AUTHOR_OPTIONS_NUM = 6;
  
  // ----------------------------FETCH HAIKU
  useEffect(() => {

    if(haiku === undefined) { /* if there isn't already a haiku in state */
      getHaiku(haikuId);
    }
  }, []);

  // ---------------------------ASSIGN LOCAL STATE
  const [authorSelection, setAuthorSelection] = useState([]);
  const [challengeAcceptedTS, setChallengeAcceptedTS] = useState(null);
  const [challengeCompletedTS, setChallengeCompletedTS] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [authorOptions, setAuthorOptions] = useState([]);
  const [authorOptionsSelected, setAuthorOptionsSelected] = useState(false);

  /* countdown timer */
  const [timeLeft, setTimeLeft] = useState(3); 
  const [timeStarted, setTimeStarted] = useState(false);
  
  /* step slice of state */
  const [step, setStep] = useState(0);


  
  // --------------------------COUNTDOWN TIMER
  const startCountDown = () => { setTimeStarted(true) }

  useEffect(() => {

    if (timeLeft === 0 && timeStarted) { /* countdown has finished */
      toggleNext();
    }

    if(!timeLeft || !timeStarted) { /* countdown hasn't begun */
      return;
    };

    const intervalId = setInterval(() => {
  
      setTimeLeft(timeLeft - 1);

    }, 1000);

    return () => {
      clearInterval(intervalId);
    };

  }, [timeLeft, timeStarted])
  

  // -------------------------COMPLETED CHALLENGE
  
  useEffect(() => {
    if(challengeCompleted) {
  
      updateHaiku(haikuId, 
                    currUserId, 
                    challengeCompleted,
                    challengeAcceptedTS, 
                    challengeCompletedTS
                    );    
    }
  }, [challengeCompleted])

  // -------------------------OPENED CHALLENGE
  
  useEffect(() => {
    if(challengeAcceptedTS) {
      updateHaiku(haikuId, 
                    currUserId, 
                    challengeCompleted,
                    challengeAcceptedTS, 
                    challengeCompletedTS
                    );    
    }
  }, [challengeAcceptedTS])


  async function acceptChallengeAndToggleNext() {

    if (!openTS) {
      setChallengeAcceptedTS(Date.now());
    }
    toggleNext();
    startCountDown();

  }

  // if the user has made a guess
  function randomShuffle(array) {
      
      let shuffled = array.slice(0);

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }

      return shuffled
  }
 
  function setInitialAuthorOptions() {
    
    if(authorOptions.length === 0) {

      let authorsFromHaikuBody = Object.keys(haiku.body);
      setAuthorOptions(authorOptions.concat(authorsFromHaikuBody));
      
    }
  }

   //adds other options to the authorOptions array
  function generateAllAuthorOptions() { 

    if(authorOptions.length !== 0 && !authorOptionsSelected) {
      

      let toShuffle = authorOptions.slice(0);
 
      while(toShuffle.length < AUTHOR_OPTIONS_NUM) {
  
          let randomAuthorId = Math.floor(Math.random() * Object.keys(authors).length)
          let randomAuthor = authors[randomAuthorId];

          if( !toShuffle.includes(randomAuthor)) {

            toShuffle = toShuffle.concat(randomAuthor);
            toShuffle = randomShuffle(toShuffle);
          }
      }

      setAuthorOptions(toShuffle);
      setAuthorOptionsSelected(true);
    } 

  }


  function handleAuthorSelect(e) {
    
    const selection = e.currentTarget.innerText;
    e.target.dataset.selected = true;

  
    //previously selection, user wants to unselect
    if (authorSelection.includes(selection)) {  
      
      let newAuthorSelection = authorSelection.slice(0).filter((value, index, arr) => {
        return value !== selection
      
      }); 
      setAuthorSelection(newAuthorSelection);

    //not previously selected, and there's still open slots
    } else if(authorSelection.length < Object.keys(haiku.body).length) { 
      setAuthorSelection([...authorSelection, selection])
    }
  }

  //compares the users guess against the correct answer 
  function selectionMatches() { 

    if (authorSelection.length === 0) return false;
    let correctAuthors = Object.keys(haiku.body);
    
    for(let select of authorSelection) {
      if (!correctAuthors.includes(select)) return false; 
    }

    return true; 
  }

  function makeSelectionAndToggleNext() {

    if(authorSelection.length === 0) return;

    if (selectionMatches() && currUserId) { 

      setChallengeCompletedTS(Date.now());
      setChallengeCompleted(true);

    } else if (selectionMatches() && !currUserId) {
      setStep(5); //send to CorrectSelectionNotLoggedIn
      
    } else {
      setStep(3); //send to IncorrectSelection step
    }
  }

  function backToMakeSelection() {
    setAuthorSelection([]); //reset the authorSelection
    toggleBack(); //go back
  }

  // ----------------------------------STEPS

  const AcceptChallenge = memo(() => {

    let username = (users && haiku && users[haiku.creator]) ? users[haiku.creator].username : undefined;
    
    if (username) {
      return (
        <>
          <Message>You've been challenged by</Message>
          <MsgHighlight>{users[haiku.creator].username}</MsgHighlight>
          <MsgSub>Ready to Guess Who?</MsgSub>
          <Button onClick={() => acceptChallengeAndToggleNext()}>
            Accept Challenge
          </Button>
        </>
      );
    }

  });
  
  const GetReadyPage = memo(() => (
    <>
      <Message>Answer faster for a higher score:</Message>
      <MsgSub>Ready, in:</MsgSub>
      <MsgHighlight>
        <Countdown>{timeLeft}</Countdown>
      </MsgHighlight>
    </>
  ));


  const MakeSelection = memo(() => {

    let haikuAuthors = Object.keys(haiku.body);

    if (authors) {

      setInitialAuthorOptions(haikuAuthors);
      generateAllAuthorOptions();

      let haikuText = formatHaiku(haiku.body, haikuAuthors);

      return (
        <>
          <HaikuContainer>

            <Haiku>
            {haikuText.map((line, idx) => {

              return (
                <HaikuLineIndex key={idx}>
                  { (idx === 0 || idx === 2) ? <AuthorIconSm src={authorAvatars["Unknown"].url}></AuthorIconSm> : null }
                  <HaikuLine>{line}</HaikuLine>
                  {(idx === 1) ? <AuthorIconSm src={authorAvatars["Unknown"].url}></AuthorIconSm> : null}
                </HaikuLineIndex>
              )


            })}
            </Haiku>
            
          </HaikuContainer>
          <Message>Pick {haikuAuthors.length} author(s):</Message>
          <LIContainer>
            {authorOptions.map((option, idx) => (
              < LIElement onClick={handleAuthorSelect} key={idx}>
                <AuthorIcon data-selected={authorSelection.includes(option)} src={authorAvatars[option].url} alt={option} />

                {option}
              </LIElement>
            ))}
          </LIContainer>
          <Button onClick={() => makeSelectionAndToggleNext()}>
            Make Guess
          </Button>
          <p></p>
        </>
      );
    } else {
      return null;
    }
   
  });

  const IncorrectSelection = memo(() => (
    <>
      <p>That was incorrect, keep trying!</p>
      <Button onClick={() => backToMakeSelection()}>Try Again</Button>
    </>
  ));

  const CorrectSelectionNotLoggedIn = memo(() => (
    <>
      <p>CORRECT! Now make an account to share</p>
    </>
  ));


  const [reverse, setReverse] = useState(false);
  const Steps = [
                  AcceptChallenge, 
                  GetReadyPage, 
                  MakeSelection, 
                  IncorrectSelection, 
                  CorrectSelectionNotLoggedIn
                ];


  // ----------------------------------------TOGGLING STEPS              
  const toggleBack = () => {
    let prevStep = step - 1 < 0 ? Steps.length - 1 : step - 1;
    setStep(prevStep);
    setReverse(true);
  };

  const toggleNext = () => {
    let nextStep = step + 1 < Steps.length ? step + 1 : 0;
    setStep(nextStep);
    setReverse(false);
  };


  return (
    <HSContainer>
      { (haiku && users) ? React.createElement(Steps[step]): null }
    </HSContainer>
  );  


};

export default SolveHaiku

