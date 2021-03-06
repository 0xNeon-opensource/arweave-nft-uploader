import * as dataUploader from '../utils/dataUploader';
import * as fileUtils from '../utils/fileUtils';
import testArweaveKey from '../testData/testArweaveKey.json';
import Arweave from 'arweave';
import { ARLOCAL_BASE_URL } from '../constants';
import ArweaveNftUploader from '../utils/arweaveNftUploader';
import singleMetadata from '../testData/testMetadata/1.json';
import { readFileSync } from 'fs';

describe('arweaveNftUploader not mainnet', () => {
  let arweave: Arweave;
  const isMainnet = false;
  let arweaveNftUploader: ArweaveNftUploader;

  beforeEach(() => {
    arweave = Arweave.init({});
    arweaveNftUploader = new ArweaveNftUploader(arweave, testArweaveKey, isMainnet);
  });

  it('should create a new instance of the class with correct values if not mainnet', () => {
    expect(arweaveNftUploader.arweaveInstance).toBe(arweave);
    expect(arweaveNftUploader.key).toBe(testArweaveKey);
    expect(arweaveNftUploader.isMainnet).toBe(isMainnet);
  });

  it('should throw an error if images and metadata count are mismatched', async () => {
    const imagePath = 'src/testData/mismatched/twoImages';
    const fullMetadataPath = 'src/testData/mismatched/threeMetadata.json';

    expect(
      async () => await arweaveNftUploader.uploadImageDirAndFullMetadataFile(imagePath, fullMetadataPath),
    ).rejects.toThrow('The count of images does not equal the count of metadata objects.');
  });

  it("should upload an image and the image's metadata with the image txn", async () => {
    const imagePath = 'src/testData/testImages/1.jpg';
    const spyFileUtilsUpdateMetadataWithImageURI = jest.spyOn(fileUtils, 'updateMetadataWithImageURI');
    const imageTx = 'ImageTx';
    const expectedImageURI = ARLOCAL_BASE_URL + imageTx;
    const metadataTx = 'MetadataTx';
    const expectedMetadataURI = ARLOCAL_BASE_URL + metadataTx;
    jest.spyOn(dataUploader, 'uploadImageFromPath').mockResolvedValueOnce(imageTx);
    jest.spyOn(dataUploader, 'uploadSingleMetadata').mockResolvedValueOnce(metadataTx);

    const actualMetadataURI = await arweaveNftUploader.uploadSingleImagePathAndMetadataObject(
      imagePath,
      singleMetadata,
    );

    expect(spyFileUtilsUpdateMetadataWithImageURI).toBeCalledWith(singleMetadata, expectedImageURI);
    expect(expectedMetadataURI).toBe(actualMetadataURI);
  });

  it("should upload an image and the image's metadata using the file paths", async () => {
    const imagePath = 'src/testData/testImages/1.jpg';
    const metadataPath = 'src/testData/testMetadata/1.json';
    const expectedMetadataURI = 'arweave.net/blah';
    const expectedMetadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    const spyArweaveNftUploaderUploadSingleImagePathAndMetadataObject = jest
      .spyOn(arweaveNftUploader, 'uploadSingleImagePathAndMetadataObject')
      .mockResolvedValue(expectedMetadataURI);

    const actualMetadataURI = await arweaveNftUploader.uploadSingleImagePathAndMetadataPath(imagePath, metadataPath);

    expect(spyArweaveNftUploaderUploadSingleImagePathAndMetadataObject).toBeCalledWith(imagePath, expectedMetadata);
    expect(expectedMetadataURI).toBe(actualMetadataURI);
  });

  it("should upload all images in a dir and upload those image's metadata with the image txns", async () => {
    const imageDirPath = 'src/testData/testImages';
    const fullMetadataPath = 'src/testData/testMetadata/testMetadata.json';
    const spyFileUtilsUpdateMetadataWithImageURI = jest.spyOn(fileUtils, 'updateMetadataWithImageURI').mockClear();

    // First image and metadata
    const imageTx1 = 'ImageTx1';
    const expectedImageURI1 = ARLOCAL_BASE_URL + imageTx1;
    const metadataTx1 = 'MetadataTx1';
    const expectedMetadataURI1 = ARLOCAL_BASE_URL + metadataTx1;
    jest.spyOn(dataUploader, 'uploadImageFromPath').mockResolvedValueOnce(imageTx1);
    jest.spyOn(dataUploader, 'uploadSingleMetadata').mockResolvedValueOnce(metadataTx1);

    // Second image and metadata
    const imageTx2 = 'ImageTx2';
    const expectedImageURI2 = ARLOCAL_BASE_URL + imageTx2;
    const metadataTx2 = 'MetadataTx2';
    const expectedMetadataURI2 = ARLOCAL_BASE_URL + metadataTx2;
    jest.spyOn(dataUploader, 'uploadImageFromPath').mockResolvedValueOnce(imageTx2);
    jest.spyOn(dataUploader, 'uploadSingleMetadata').mockResolvedValueOnce(metadataTx2);

    // Third image and metadata
    const imageTx3 = 'ImageTx3';
    const expectedImageURI3 = ARLOCAL_BASE_URL + imageTx3;
    const metadataTx3 = 'MetadataTx3';
    const expectedMetadataURI3 = ARLOCAL_BASE_URL + metadataTx3;
    jest.spyOn(dataUploader, 'uploadImageFromPath').mockResolvedValueOnce(imageTx3);
    jest.spyOn(dataUploader, 'uploadSingleMetadata').mockResolvedValueOnce(metadataTx3);

    // Fourth image and metadata
    const imageTx4 = 'ImageTx4';
    const expectedImageURI4 = ARLOCAL_BASE_URL + imageTx4;
    const metadataTx4 = 'MetadataTx4';
    const expectedMetadataURI4 = ARLOCAL_BASE_URL + metadataTx4;
    jest.spyOn(dataUploader, 'uploadImageFromPath').mockResolvedValueOnce(imageTx4);
    jest.spyOn(dataUploader, 'uploadSingleMetadata').mockResolvedValueOnce(metadataTx4);

    const txnList = await arweaveNftUploader.uploadImageDirAndFullMetadataFile(imageDirPath, fullMetadataPath);

    expect(spyFileUtilsUpdateMetadataWithImageURI).nthCalledWith(1, expect.any(Object), expectedImageURI1);
    expect(spyFileUtilsUpdateMetadataWithImageURI).nthCalledWith(2, expect.any(Object), expectedImageURI2);
    expect(spyFileUtilsUpdateMetadataWithImageURI).nthCalledWith(3, expect.any(Object), expectedImageURI3);
    expect(spyFileUtilsUpdateMetadataWithImageURI).nthCalledWith(4, expect.any(Object), expectedImageURI4);
    expect(txnList).toEqual([expectedMetadataURI1, expectedMetadataURI2, expectedMetadataURI3, expectedMetadataURI4]);
  });
});
