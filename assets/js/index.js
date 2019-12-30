const contractSource = `
contract UniVote =
  
    
  record candidate = 
    {
    id : int,
    creatorAddress : address,
    image1 : string,
    image2 : string,
    image3 : string,
    name : string,
    description : string,
    amount : int,
    voteCount : int
    }
    
  record state = {
    candidates : map(int, candidate),
    candidateLength : int}
    
  entrypoint init() = { 
    candidates = {},
    candidateLength = 0}

  
  entrypoint getCandidate(index : int) : candidate = 
    switch(Map.lookup(index, state.candidates))
      None => abort("Candidate does not exist with this index")
      Some(x) => x  
    
    
    //Registers a candidate
    
  payable stateful entrypoint createCandidate( image1' : string, image2' : string, image3' : string, name' : string, description' : string) = 
    let timestamp = Chain.timestamp
    let candidateReg = {
      id = getCandidateLength()+1,
      creatorAddress  = Call.caller,
      image1 = image1',
      image2 = image2',
      image3 = image3',
      name = name', 
      description = description',
      amount = 40000,
      voteCount = 0
      
      }
    Chain.spend(ak_2CPHkUq31gjkv7mr6Yc8puQVZhu16YQYZ5hAZiTV43BRPqLAZv, candidateReg.amount)
    
    
      
    let index = getCandidateLength() + 1
    put(state{candidates[index] = candidateReg, candidateLength = index})
    
    
                                  //returns lenght of candidates registered
 
  entrypoint getCandidateLength() : int = 
    state.candidateLength
    
                                  //returns number of votes
    
  entrypoint getVoteCount(index : int) = 
    state.candidates[index].voteCount 
    
                                  //vote a candidate
      
  stateful entrypoint vote(index : int) = 
    let person = getCandidate(index)
    let votePerson = {
      id = person.id,
      creatorAddress  = person.creatorAddress,
      image1 = person.image1,
      image2 = person.image2,
      image3 = person.image3,
      name = person.name, 
      description = person.description,
      amount = 40000,
      voteCount = person.voteCount+1
      
    
      }
    
    
    
    put(state{candidates[index] = votePerson})
  
    
    "VOTED SUCCESSFULLY"
  
    `;


const contractAddress = 'ct_QYAjM2eRdNd2PSny1Co9YMTnrGUgwZSShtNhzbV4FeX7cJbt5';
var CandidateArray = [];
var client = null;
var CanndidateLength = 0;



function renderProduct() {
  CandidateArray = CandidateArray.sort(function (a, b) {
    return b.Price - a.Price
  })
  var template = $('#template').html();

  Mustache.parse(template);
  var rendered = Mustache.render(template, {
    CandidateArray
  });




  $('#body').html(rendered);
  
}
//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });
  
  const calledGet = await contract.call(func, args, {
    callStatic: true
  }).catch(e => console.error(e));
 
  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log("number of posts : ", decodedGet)
  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {
    contractAddress
  });
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {
    amount: value
  }).catch(e => console.error(e));

  return calledSet;
}

// reading from the blockchain and rendering it

window.addEventListener('load', async () => {
  $('.registerForm').hide()
  $("#loading-bar-spinner").show();

  client = await Ae.Aepp()

  CandidateLength = await callStatic('getCandidateLength', []);


  for (let i = 1; i <= CandidateLength; i++) {
    const persons = await callStatic('getCandidate', [i]);

    console.log("calling contract")

    CandidateArray.push({
      id: persons.id,
      image1: persons.image1,
      image2: persons.image2,
      image3: persons.image3,

      name: persons.name,
      description: persons.description,
      voteCount: persons.voteCount
    })

    renderProduct();
    $("#loading-bar-spinner").hide();
  }
});


// When user votes a candidate

$("#body").on("click", ".voteBtn", async function (event) {
  $("#loading-bar-spinner").show();
  console.log("Just Clicked The vote Button")


  dataIndex = CandidateArray.length


  await contractCall('vote', [dataIndex], 0)


  // location.reload(true)
  renderProduct();
  $("#loading-bar-spinner").hide();
});



$('.registerLink').click(function(

){
  console.log('nav bar clicked')

  $('#about').hide()
  $('#body').hide()
  $('.registerForm').show()
})

//  When uset registers a candidate

$('.regBtn').click(async function(){
  $("#loading-bar-spinner").show();
  console.log("Button Clicked")
  const candidate_name = ($('#Candidatename').val());
  const candidate_image1 = ($("#Candidateimage1").val());
  const candidate_image2 = ($("#Candidateimage2").val());
  const candidate_image3 = ($("#Candidateimage3").val());
  const candidate_description = ($("#Candidatemessage").val());
  console.log("-------------------------------------")
  console.log("Name:",candidate_name)
  console.log("image1:",candidate_image1)
  console.log("Image2:",candidate_image2)
  console.log("Image3:",candidate_image3)

  const new_candidate = await contractCall('createCandidate', [candidate_image1, candidate_image2, candidate_image3,candidate_name,candidate_description],40000);
  console.log("Sucessfull registered", new_candidate)

  CandidateArray.push({
    id: new_candidate.id,
    image1: new_candidate.image1,
    image2: new_candidate.image2,
    image3: new_candidate.image3,

    name: new_candidate.name,
    description: new_candidate.description,
    voteCount: new_candidate.voteCount
  })


  renderProduct();
  

  $("#loading-bar-spinner").hide();
  location.reload(true)

});
