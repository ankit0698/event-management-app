import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation} from '@tanstack/react-query'

import Header from '../Header.jsx';
import { deleteEvent, fetchEvent, queryClient } from '../../Util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {

  const params= useParams()
  const navigate= useNavigate()
  const[isDeleting, setIsDeleting]=useState(false)



  const {data, isPending, isError, error}= useQuery({
    queryKey: ['events', params.id],
    queryFn : ({signal})=>fetchEvent({ signal, id: params.id}),
    
  })

  const{mutate, isPending:isPendingDeletion, isError:isErrorDeletion, error: errorDeletion}=useMutation({
    mutationFn : deleteEvent,
    onSuccess: ()=>{
      queryClient.invalidateQueries({
        queryKey:['events'],
        refetchType:'none'
      })
      navigate('/events')
    }
  })

  function handleStartDelete(){
    setIsDeleting(true)
  }

  function handleStopDeleting(){
    setIsDeleting(false)
  }

  function deleteHandler(){
    mutate({id : params.id})
   

  }
  
  let content

  if(isPending){
      content=(
        <div id='event-details-content' className='center'>
          <p> Fetching event data...</p>
        </div>
      )
  }

  if(isError){
    content =(
      <div id='event-details-content' className='center'>
        <ErrorBlock title= "Error loading details" 
        message={error.info?.message || 'Could not load data'} />
      </div>
    )
  }
   
  if(data){
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month : 'short',
      year: 'numeric'
    })
    content = (

      <>
        <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
        
      </article>
      
      </>
      
    )
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDeleting}>
        <h2>Are you sure?</h2>
        <p>As this can not be undone</p>
        <div className='form-actions'>
          {isPendingDeletion && <p>Deleting...</p>}
          {!isPendingDeletion && (<>
              <button onClick={handleStopDeleting} className='button-text'>Cancel</button>
              <button onClick={deleteHandler} className='button'>Delete</button>
              </>)}
      
        </div>
        {isErrorDeletion && <ErrorBlock title="Error deleting event"
        message={errorDeletion.info?.message || 'Unable to delete'}/>}
     </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
     
      

     
    
    
    </>
  );
}