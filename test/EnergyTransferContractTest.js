const utils = require("./TestUtils");

const EnergyTransferContract = artifacts.require("./EnergyTransferContract.sol");
const toGridPrice = utils.tupleReader("buyPrice", "sellPrice", "minimumMargin");
const toPriceDetails = utils.tupleReader("seller", "grid", "price", "isActive");
const theInstance = utils.instanceFactory(EnergyTransferContract);

contract('Energy Transfer Contract', (accounts) => {
  const gridAccount = accounts[0];
  const buyerAccount = accounts[1];
  const sellerAccount = accounts[2];

  theInstance("Should record grid prices", async (instance) => {
    await utils.checkLogs(() => instance.publishGridPrice(10, 20, 5, { from: gridAccount }))
      .contains("GridPriceChanged", {
      grid: gridAccount,
      buyPrice: 10,
      sellPrice: 20,
      minimumMargin: 5
    });

    const gridPrice = toGridPrice(await instance.getCurrentGridPrice(gridAccount));

    assert.deepEqual(gridPrice, {
      buyPrice: 10,
      sellPrice: 20,
      minimumMargin: 5
    });
  });

    theInstance("Should replace an existing grid price with a new grid price", async (instance) => {
      await utils.checkLogs(() => instance.publishGridPrice(10, 20, 5, { from: gridAccount }))
        .contains("GridPriceChanged", {
          grid: gridAccount,
          buyPrice: 10,
          sellPrice: 20,
          minimumMargin: 5
        });

      await utils.checkLogs(() => instance.publishGridPrice(15, 25, 5, { from: gridAccount }))
        .contains("GridPriceChanged", {
          grid: gridAccount,
          buyPrice: 15,
          sellPrice: 25,
          minimumMargin: 5
        });

      const gridPrice = toGridPrice(await instance.getCurrentGridPrice(gridAccount));

      assert.deepEqual(gridPrice, {
        buyPrice: 15,
        sellPrice: 25,
        minimumMargin: 5
      });
    });

    theInstance("Should record seller offers", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      await utils.checkLogs(() => instance.offerPrice(gridAccount, 12, { from: sellerAccount }))
        .contains("PriceOffered", {
          grid: gridAccount,
          priceId: 0,
          price: 12
        });

      const priceDetails = toPriceDetails(await instance.getPriceDetails(0));

      assert.deepEqual(priceDetails, {
        seller: sellerAccount,
        grid: gridAccount,
        price: 12,
        isActive: true
      });
    });

    theInstance("Should not accept a seller offer which conflicts with the current grid price", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      try {
        // Offered price is below the current grid buy price
        await instance.offerPrice(gridAccount, 9, { from: sellerAccount });
        assert.failed("Offer below the current grid buy price should have been refused");
      } catch(e) {}

      try {
        /* There is no possible offer from a buyer that is lower than the grid sell price
           but within the grid's demanded margin.
        */
        await instance.offerPrice(gridAccount, 17, { from: sellerAccount });
        assert.failed("Offer outside of the grid's minimum margin should have been refused");
      } catch(e) {}
    });

    theInstance("Should match the cheapest seller offer below the buyer's bid price", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

    });

    theInstance("Should match a buyer bid with the lowest valid seller offer", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      // The seller offers two units at different prices.
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 11, { from: sellerAccount });

      await utils.checkLogs(() => instance.agreePrice(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("PriceAgreed", {
          grid: gridAccount,
          buyer: buyerAccount,
          seller: sellerAccount,
          agreedBuyPrice: 16, // buyPrice + grid margin
          agreedSellPrice: 11
        });
    });
});
