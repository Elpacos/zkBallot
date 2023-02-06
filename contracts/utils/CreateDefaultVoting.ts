const DEFAULT_DESCRIPTION = 'Default Voting Description, created by the CreateDefaultVoting script in the Voting utils'
const DEFAULT_CHOICES = ['Yes', 'No', 'Abstain', 'Not Voting']
const MIN_DELAY = 60 * 60 * 2; // 2 hours
const DEFAULT_DELAY = 60 * 60 * 3; // 2 hours

/***  Create a new voting
 @param name - name of the voting
 @param choices - number of choices
 @param started - if the voting has started
 @param ended - if the voting has ended
 @param whitelist - list of voters
 @param factory - voting factory contract
 @param owner - signer ***/
export default async function createDefaultVoting(
    name: string,
    choiceNum: number,
    started: boolean,
    ended: boolean,
    whitelist: string[],
    factory: any,
    owner: any
) {
    const dates = getEndedDate(started, ended);
    console.log('Creating Voting with dates', dates);
    const contractTx = await factory.connect(owner).createVotation(
        name,
        DEFAULT_DESCRIPTION,
        DEFAULT_CHOICES.slice(0, choiceNum),
        whitelist,
        dates[0],
        dates[1]
    );
    // wait for the transaction to be mined
    const receipt = await contractTx.wait();
    // get the contract address from the receipt
    const votingAddress = receipt.events[1].args[0];
    const voting = await ethers.getContractAt('Votation', votingAddress);
    return voting;
}

// setup dates
function getEndedDate(started: boolean, ended: boolean) {
    const now = (new Date().getTime() / 1000);
    const nowInt = Math.floor(now);
    const start = started ? nowInt - DEFAULT_DELAY : nowInt + DEFAULT_DELAY;
    const end = ended ? start + MIN_DELAY : start + DEFAULT_DELAY + MIN_DELAY;
    return [start, end];
}
