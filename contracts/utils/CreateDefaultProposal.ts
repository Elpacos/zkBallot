export const DEFAULT_DESCRIPTION = 'Default Proposal Description, created by the CreateDefaultProposal script in utils'
export const DEFAULT_CHOICES = ['Yes', 'No', 'Abstain', 'Not Voting']
const MIN_DELAY = 60 * 60 * 2; // 2 hours
const DEFAULT_DELAY = 60 * 60 * 3; // 2 hours

/**
 * @notice Creates a new proposal.
 * @param name name of the proposal
 * @param choiceNum number of choices of the proposal
 * @param token address of the token to be used
 * 
 * @param choices array of the choices
 * @param startDate start date of the proposal
 * @param endDate end date of the proposal
 * @return the contract object of the created proposal
 */
export default async function createDefaultProposal(
    name: string,
    choiceNum: number,
    token: any,
    started: boolean,
    ended: boolean,
    factory: any,
    owner: any
) {
    //calculate the dates
    const dates = getEndedDate(started, ended);
    console.log('Creating Proposal with dates: ', dates);

    // create the proposal through the factory
    const contractTx = await factory.connect(owner).createProposal(
        name,
        DEFAULT_DESCRIPTION,
        token,
        DEFAULT_CHOICES.slice(0, choiceNum),
        dates[0],
        dates[1]
    );
    // wait for the transaction to be mined
    const receipt = await contractTx.wait();
    // get the contract address from the receipt
    const proposalAddress = receipt.events[1].args[0];
    const proposal = await ethers.getContractAt('Proposal', proposalAddress);
    
    return proposal;
}

// setup dates for the proposal based on the boolean flags
function getEndedDate(started: boolean, ended: boolean) {
    const now = (new Date().getTime() / 1000);
    const nowInt = Math.floor(now);
    const start = started ? nowInt - DEFAULT_DELAY : nowInt + DEFAULT_DELAY;
    const end = ended ? start + MIN_DELAY : start + DEFAULT_DELAY + MIN_DELAY;
    return [start, end];
}
