import { expect, env } from './setup'
import { AccountType } from '../scripts/types'
import { GenesisJsonProvider } from './provider'

describe('predeploys', () => {
  const predeploys = {
    eth: [],
    newNotEth: [],
    noWipe: [],
    wipe: [],
    weth: [],
  }
  // Base genesis file only
  let genesisStateProvider: GenesisJsonProvider
  // Old sequencer state
  let oldStateProvider: GenesisJsonProvider

  before(async () => {
    await env.init()
    predeploys.eth = env.getAccountsByType(AccountType.PREDEPLOY_ETH)
    predeploys.newNotEth = env.getAccountsByType(
      AccountType.PREDEPLOY_NEW_NOT_ETH
    )
    predeploys.noWipe = env.getAccountsByType(AccountType.PREDEPLOY_NO_WIPE)
    predeploys.wipe = env.getAccountsByType(AccountType.PREDEPLOY_WIPE)
    predeploys.weth = env.getAccountsByType(AccountType.PREDEPLOY_WETH)

    genesisStateProvider = new GenesisJsonProvider(
      env.surgeryDataSources.genesis
    )
    oldStateProvider = new GenesisJsonProvider(
      env.surgeryDataSources.configs.stateDumpFilePath
    )
  })

  describe('new predeploys that are not ETH', () => {
    for (const [i, account] of predeploys.newNotEth.entries()) {
      describe(`account ${i}/${predeploys.newNotEth.length} (${account.address})`, () => {
        it('should have the exact state specified in the base genesis file', async () => {
          const preBytecode = await genesisStateProvider.getCode(
            account.address
          )
          const postBytecode = await env.postL2Provider.getCode(account.address)
          expect(preBytecode).to.eq(postBytecode)

          // check storage

          const preNonce = await genesisStateProvider.getTransactionCount(
            account.address,
            env.config.stateDumpHeight
          )
          const postNonce = await env.postL2Provider.getTransactionCount(
            account.address
          )
          expect(preNonce).to.deep.eq(postNonce)

          const preBalance = await genesisStateProvider.getBalance(
            account.address,
            env.config.stateDumpHeight
          )
          const postBalance = await env.postL2Provider.getBalance(
            account.address
          )
          expect(preBalance).to.deep.eq(postBalance)
        })
      })
    }
  })

  describe('predeploys where the old state should be wiped', () => {
    for (const [i, account] of predeploys.wipe.entries()) {
      describe(`account ${i}/${predeploys.wipe.length} (${account.address})`, () => {
        it('should have the code and storage of the base genesis file', async () => {
          const preBytecode = await genesisStateProvider.getCode(
            account.address
          )
          const postBytecode = await env.postL2Provider.getCode(account.address)
          expect(preBytecode).to.eq(postBytecode)

          // check storage
        })

        it('should have the same nonce and balance as before', async () => {
          const preNonce = await oldStateProvider.getTransactionCount(
            account.address,
            env.config.stateDumpHeight
          )
          const postNonce = await env.postL2Provider.getTransactionCount(
            account.address
          )
          expect(preNonce).to.deep.eq(postNonce)

          const preBalance = await oldStateProvider.getBalance(
            account.address,
            env.config.stateDumpHeight
          )
          const postBalance = await env.postL2Provider.getBalance(
            account.address
          )
          expect(preBalance).to.deep.eq(postBalance)
        })
      })
    }
  })

  describe('predeploys where the old state should be preserved', () => {
    for (const [i, account] of predeploys.noWipe.entries()) {
      describe(`account ${i}/${predeploys.noWipe.length} (${account.address})`, () => {
        it('should have the code of the base genesis file', async () => {
          const preBytecode = await genesisStateProvider.getCode(
            account.address
          )
          const postBytecode = await env.postL2Provider.getCode(account.address)
          expect(preBytecode).to.eq(postBytecode)
        })

        it('should have the combined storage of the old and new state', async () => {
          // check storage
        })

        it('should have the same nonce and balance as before', async () => {
          const preNonce = await oldStateProvider.getTransactionCount(
            account.address,
            env.config.stateDumpHeight
          )
          const postNonce = await env.postL2Provider.getTransactionCount(
            account.address
          )
          expect(preNonce).to.deep.eq(postNonce)

          const preBalance = await oldStateProvider.getBalance(
            account.address,
            env.config.stateDumpHeight
          )
          const postBalance = await env.postL2Provider.getBalance(
            account.address
          )
          expect(preBalance).to.deep.eq(postBalance)
        })
      })
    }
  })

  describe('OVM_ETH', () => {
    for (const [i, account] of predeploys.eth.entries()) {
      describe(`account ${i}/${predeploys.eth.length} (${account.address})`, () => {
        it('should have disabled ERC20 features', async () => {
          // .transfer should not work? need live provider
        })

        it('should have a new balance for WETH9 equal to the sum of the moved contract balances', async () => {
          // need live provider for WETH balances
        })
      })
    }
  })

  describe('WETH9', () => {
    for (const [i, account] of predeploys.weth.entries()) {
      describe(`account ${i}/${predeploys.weth.length} (${account.address})`, () => {
        it('should no recorded ETH balance', async () => {
          const postBalance = await env.postL2Provider.getBalance(
            account.address
          )
          expect(postBalance.toNumber()).to.eq(0)
        })

        it('should have WETH balances for each contract that should move', async () => {
          // need live provider for WETH balances
        })

        it('should have a balance equal to the sum of all moved balances', async () => {
          // need live provider for WETH balances
        })
      })
    }
  })
})
