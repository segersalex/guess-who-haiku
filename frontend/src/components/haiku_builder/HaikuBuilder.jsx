import React, { useState, useEffect } from 'react';

const HaikuBuilder = ({createHaiku, createHaikuShares, fetchAuthors, fetchNewHaiku, authors, newHaiku, users, openModal}) => {

    //fetch authors on load
    useEffect(() => {
        fetchAuthors();    
    }, [fetchAuthors])

    //set selected authors in local state
    const [haikuAuthors, setHaikuAuthors] = useState([]);

    //update selection of haiku authors
    const handleAuthorSelection = e => {
        let newAuthor = e.currentTarget.dataset.name;
        if (!haikuAuthors.includes(newAuthor) && haikuAuthors.length < 1) {
            setHaikuAuthors([...haikuAuthors, newAuthor])
        } else if (haikuAuthors.includes(newAuthor)) {
            setHaikuAuthors(haikuAuthors.filter(author => (author !== newAuthor)) )
        }
    }

    //create new haiku
    const generateHaiku = e => {
        e.preventDefault();
        fetchNewHaiku(haikuAuthors)
    }

    //set selected users to share with in local state
    const [haikuShares, setHaikuShares] = useState([]);

    //update selection of users shared with
    const handleShareSelection = e => {
        let newShare = e.currentTarget.dataset.username;
        //console.log(newShare);
        if (!haikuShares.includes(newShare)) {
            setHaikuShares([...haikuShares, newShare])
        } else if (haikuShares.includes(newShare)) {
            setHaikuShares(haikuShares.filter(user => (user !== newShare)))
        }
    }

    //share haiku

    
    //steps
    const ChooseAuthors = () => (
        <>
            <p>Choose up to three figures below:</p>
            <ul>
                {authors.data && authors.data.map(author => (
                    <li data-selected={haikuAuthors.includes(author.name)} key={author.name} data-name={author.name} onClick={handleAuthorSelection}>
                        <img src={author.image} alt={author.name} />
                    </li>
                ))}
            </ul>
            <button onClick={generateHaiku}>Build my Haiku!</button>
        </>
    );

    const GeneratingHaiku = () => (
        <>
            <h1>Just one moment while we build your haiku...</h1>
        </>
    );

    const GeneratedHaiku = () => (
        <>
            <div>
                <div>{newHaiku}</div>
                <div>{newHaiku}</div>

            </div>
            <button>Regenerate haiku</button>
            <button>Let me start over</button> 
            <button onClick={openModal}>Save for later</button>
            <button onClick={openModal}>Share now</button>   
        </>
    );

    const ShareHaiku = () => (
        <>
            <p>Challenge a friend (or a few friends) to solve your haiku by choosing them below, or generating a link and sending it to them.</p>
            <ul>
                {users && users.map(user => (
                    <li data-selected={haikuShares.includes(user.username)} key={user.username} data-username={user.username} onClick={handleShareSelection}>
                        <strong>{user.username}</strong>
                    </li>
                ))}
            </ul>
            <button>Share</button>
            {/* set input value to current haiku id */}
            <input type="text" name="link"/>
            <button>Share via link</button>
        </>
    )
    
    return (
        <div>
            <ChooseAuthors />
        </div>
    )
}

export default HaikuBuilder;